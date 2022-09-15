import { logger } from "firebase-functions";
import * as express from "express";

import { getAllTasks as onFleetGetAllTasks } from "../../integrations/onFleet/getAllTasks";
import { tomorrowTasks as tomorrowTasksFilter } from "../../integrations/onFleet/filters/tomorrowTasks";
import { generateHourlyTimeSlot } from "../utils/generateHourlyTimeSlot";
import { generateOrderForTasks } from "../utils/generateTaskOrder";
import { filterOnFleetExportByDbTasks } from "../utils/filterOnFleetExportByDbTasks";
import { asyncForEach } from "../../utils/asyncForEach";

import {
  insertTasks,
  updateTask,
  findTasksByIDs,
  findTasksByDate,
  findTasksByDateAndUserId,
  findTomorrowTasks,
} from "./db";

export const tasksRouter = express.Router();

// https://stackoverflow.com/questions/57771798/how-do-i-jsdoc-parameters-to-web-request
/**
 * Get tasks by "date" || "date & usedId"
 *
 * @typedef {object} getTasksRequestQuery
 * @property {string} userId id of logged user
 * @property {number} date the date for which the data will be obtained
 *
 * @param {import('express').Request<{}, {}, {}, showRequestQuery>} req
 * @param {import('express').Response} res
 */
// TODO: only "user" & "root" role should have possibility to call this route
tasksRouter.get("/", async (req, res) => {
  logger.log("Route:/ - route query parameters: ", req.query);

  const userId = req.query?.userId && String(req.query?.userId);
  const date = req.query?.date && String(req.query?.date);

  try {
    if (!date) {
      res.status(400).json({
        error: {
          message: "Missing route query parameters 'date'",
        },
      });
      return;
    }

    if (userId) {
      const tasks = await findTasksByDateAndUserId(date, userId);
      res.status(200).json(tasks);
    } else {
      const tasks = await findTasksByDate(date);
      res.status(200).json(tasks);
    }
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("Route:/ - Error: ", e);
    res.status(500).json({
      error: {
        message: (e as Error).message,
      },
    });
  }
});

/**
 * Get tasks planned for next day - dispatcher role route
 */
tasksRouter.get("/tomorrow", async (req, res) => {
  try {
    const tasks = await findTomorrowTasks();

    logger.log(
        "Route:/tomorrow - Prepared tasks ids for next day: ",
        tasks.map((task) => task.id)
    );

    res.status(200).json(tasks);
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("Route:/tomorrow - Error: ", e);
    res.status(500).json({
      error: {
        message: (e as Error).message,
      },
    });
  }
});

/**
 * Fetch tasks from onFleet planned for next day and save them to our database
 */
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
          const tasksWithOrder = generateOrderForTasks(onFleetTasks);
          const ourOnFleetTasks = tasksWithOrder.map((t) => ({ ...t, slot: generateHourlyTimeSlot(t) }));
          const databaseTasks = await findTasksByIDs(exportedTasksIds);

          const { newTasks, updatedTasks } = filterOnFleetExportByDbTasks(ourOnFleetTasks, databaseTasks);

          logger.log("Route:/onFleet/export/saveToDb - new tasks ids: ", newTasks.map((t) => t.id));
          logger.log("Route:/onFleet/export/saveToDb - updated tasks ids: ",
              updatedTasks.map((t) => t.id)
          );

          if (newTasks.length > 0) {
            await insertTasks(newTasks);
          }

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
        res.status(500).json({
          error: {
            message: (e as Error).message,
          },
        });
      }
    },
);
