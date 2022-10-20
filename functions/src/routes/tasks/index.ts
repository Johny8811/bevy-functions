import { logger } from "firebase-functions";
import * as express from "express";

import { getAllTasks as onFleetGetAllTasks } from "../../integrations/onFleet/getAllTasks";
import { tomorrowTasks as tomorrowTasksFilter } from "../../integrations/onFleet/filters/tomorrowTasks";
import { generateHourlyTimeSlot } from "../utils/generateHourlyTimeSlot";
import { generateOrderForTasks } from "../utils/generateTaskOrder";
import { asyncForEach } from "../../utils/asyncForEach";
import { filterOnFleetExportByDbTasks } from "../utils/filterOnFleetExportByDbTasks";
import { sortByWorkerAndEat } from "../utils/sortByWorkerAndEat";
import { getValueByParameterName, hasRole } from "../../integrations/firebase/remoteConfig";
import { RemoteConfigParameters } from "../../integrations/firebase/types";
import { withMiddleware } from "../../middlewares/withMiddleware";
import { withAuthorization } from "../../middlewares/withAuthorization";

import {
  findTasksByDateAndUserId,
  findTasksByDateRage,
  findTasksByIDs,
  findTomorrowTasks,
  insertTasks,
  updateTask,
} from "./db";

export const tasksRouter = express.Router();

// https://stackoverflow.com/questions/57771798/how-do-i-jsdoc-parameters-to-web-request
/**
 * Get tasks by "date" || "date & userId"
 *
 * @typedef {object} getTasksRequestQuery
 * @property {string} completeAfter the date after which tasks should be completed
 * @property {string} completeBefore the date before which tasks should be completed
 *
 * @param {import('express').Request<{}, {}, {}, getTasksRequestQuery>} req
 * @param {import('express').Response} res
 */
export const getTasks = withMiddleware(withAuthorization(async (req, res) => {
  logger.log("Route:/ - route query parameters: ", req.query);

  const completeAfter = req.query?.completeAfter && String(req.query?.completeAfter);
  const completeBefore = req.query?.completeBefore && String(req.query?.completeBefore);
  const userId = req.user.uid;

  try {
    const usersRolesStr = await getValueByParameterName(RemoteConfigParameters.USERS_ROLES);
    const usersRoles = usersRolesStr ? JSON.parse(usersRolesStr) : {};
    const roles = usersRoles[userId];

    logger.log("Route:/ - user roles: ", roles);

    if (hasRole(roles, "dispatcher")) {
      const tasks = await findTomorrowTasks();

      logger.log(
          "Route:/tomorrow - IDs of prepared tasks for next day: ",
          tasks.map((task) => task.id)
      );

      res.status(200).json(tasks);
      return;
    }

    if (!completeAfter) {
      res.status(400).json({ message: "Missing route query parameters 'completeAfter'" });
      return;
    }

    if (hasRole(roles, "root")) {
      const tasks = await findTasksByDateRage(completeAfter, completeBefore);
      res.status(200).json(tasks);
      return;
    }

    if (hasRole(roles, "user")) {
      const tasks = await findTasksByDateAndUserId(completeAfter, userId);
      const sortedTasks = sortByWorkerAndEat(tasks);
      res.status(200).json(sortedTasks);
      return;
    }

    res.status(403).json({ message: "Permission denied" });
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("Route:/ - Error: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));


/**
 * Fetch tasks from onFleet planned for next day and save them to tasks database
 */
// TODO: route has to be under role access
tasksRouter.get(
    "/onFleet/export/saveToDb",
    async (req, res) => {
      try {
        const filter = tomorrowTasksFilter();
        const onFleetTasks = await onFleetGetAllTasks(filter);
        const exportedTasksIds = onFleetTasks.map((t) => t.id);

        logger.log(
            "Route:/onFleet/export/saveToDb - Prepared tasks ids for tomorrow: ",
            exportedTasksIds,
            " count: ", exportedTasksIds.length
        );

        if (onFleetTasks.length > 0) {
          const databaseTasks = await findTasksByIDs(exportedTasksIds);
          const tasksWithOrder = generateOrderForTasks(onFleetTasks);
          const ourOnFleetTasks = tasksWithOrder.map((t) => ({ ...t, slot: generateHourlyTimeSlot(t) }));

          const { newTasks, updatedTasks } = filterOnFleetExportByDbTasks(ourOnFleetTasks, databaseTasks);

          logger.log("Route:/onFleet/export/saveToDb - new tasks ids: ", newTasks.map((t) => t.id));
          logger.log("Route:/onFleet/export/saveToDb - updated tasks ids: ",
              updatedTasks.map((t) => t.id)
          );

          if (newTasks.length > 0) {
            await insertTasks(newTasks);
          }

          // TODO: Promise.all
          if (updatedTasks.length > 0) {
            await asyncForEach(updatedTasks, async (task) => {
              await updateTask(task);
            });
          }

          res.status(200).json(ourOnFleetTasks);
        } else {
          res.status(200).json([]);
        }
      } catch (e) {
      // TODO: improve error handling and logging
      //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
        logger.log("Route:/onFleet/export/saveToDb - Error: ", e);
        res.status(500).json({ message: (e as Error).message });
      }
    },
);
