import { logger } from "firebase-functions";
import { OnfleetMetadata } from "@onfleet/node-onfleet/metadata";

import { getValueByParameterName, hasRole } from "../../integrations/firebase/remoteConfig";
import { RemoteConfigParameters } from "../../integrations/firebase/types";
import { TaskMetadata } from "../../types/tasks";
import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";
import { sortByWorkerAndEat } from "../utils/sortByWorkerAndEat";
import { mapTaskDataToCreateTasksProps } from "../utils/mapTasksToCreateTasksProps";

import {
  findTasksByDateAndUserId,
  findTasksByDateRage,
  findTomorrowTasks,
} from "./db";
import { onFleetApi } from "../../integrations/onFleet";

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
export const getTasks = withCors(withAuthorization(async (req, res) => {
  logger.log("Route:/ - route query parameters: ", req.query);

  const completeAfter = req.query.completeAfter && String(req.query.completeAfter);
  const completeBefore = req.query.completeBefore && String(req.query.completeBefore);
  const userId = req.user.uid;

  try {
    const usersRolesStr = await getValueByParameterName(RemoteConfigParameters.USERS_ROLES);
    const usersRoles = usersRolesStr ? JSON.parse(usersRolesStr) : {};
    const roles = usersRoles[userId];

    logger.log("Route:/ - user roles: ", roles);

    if (hasRole(roles, "dispatcher")) {
      const tasks = await findTomorrowTasks();
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
 * Create tasks in batch in some fleet system , e.g. OnFleet
 *
 * body:
 * - tasks - array of objects of tasks, that will be created
 */
export const batchCreate = withCors(withAuthorization(async (req, res) => {
  try {
    const tasks = JSON.parse(req.body);

    const metadata: OnfleetMetadata[] = [
      {
        name: TaskMetadata.UserId,
        type: "string",
        visibility: ["api"],
        value: req.user.uid,
      },
    ];

    const createTasksProps = mapTaskDataToCreateTasksProps(tasks, metadata);
    const result = await onFleetApi.tasks.batchCreate(createTasksProps);

    res.status(201).json(result);
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("Route:/onFleet/export/saveToDb - Error: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
