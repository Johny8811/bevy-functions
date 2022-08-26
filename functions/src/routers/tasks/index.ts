import { logger } from "firebase-functions";
import * as express from "express";

import { getAllTasks as onFleetGetAllTasks } from "../../integrations/onFleet/getAllTasks";
import { filterTomorrowTasks } from "../utils";

import { insertTasks, getTasksByDate, getTasksByDateAndUserId, getTomorrowTasks } from "./db";

export const tasksRouter = express.Router();

/**
 * Fetch tasks from onFleet planned for next day and save them to our database
 */
tasksRouter.get(
    "/onFleet/export/saveToDb",
    async (req, res) => {
      try {
        const filter = filterTomorrowTasks();
        const tasks = await onFleetGetAllTasks(filter);

        logger.log(
            "Route:/onFleet/export/saveToDb - Prepared tasks ids for next day: ",
            tasks.map((task) => task.id)
        );

        if (tasks.length > 0) {
          await insertTasks(tasks);
        }

        res.status(200).json(tasks);
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

/**
 * Get tasks planned for next day - dispatcher role route
 */
tasksRouter.get("/tomorrow", async (req, res) => {
  try {
    const tasks = await getTomorrowTasks();

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

// https://stackoverflow.com/questions/57771798/how-do-i-jsdoc-parameters-to-web-request
/**
 * Get tasks by "date" || "date & used"
 *
 * @typedef {object} getTasksRequestQuery
 * @property {string} userId id of logged user
 * @property {number} date the date for which the data will be obtained
 *
 * @param {import('express').Request<{}, {}, {}, showRequestQuery>} req
 * @param {import('express').Response} res
 */
tasksRouter.get("/", async (req, res) => {
  logger.log("Route:/ - route query parameters: ", req.query);

  const userId = String(req.query?.userId);
  const date = String(req.query?.date);

  try {
    if (date.includes("undefined")) {
      res.status(400).json({
        error: {
          message: "Missing route query parameters 'date'",
        },
      });
    }

    if (userId) {
      const tasks = await getTasksByDate(date);
      res.status(200).json(tasks);
    } else {
      const tasks = await getTasksByDateAndUserId(date, userId);
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
