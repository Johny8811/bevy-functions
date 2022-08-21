import { logger } from "firebase-functions";
import * as express from "express";

import { getTasksForNextDay } from "./data";
import { insertTasks } from "./db";

export const onFleetRouter = express.Router();

onFleetRouter.get(
    "/export/saveToDb",
    async (req, res) => {
      try {
        const { tasks } = await getTasksForNextDay();
        logger.log(
            "Prepared tasks ids for next day: ",
            tasks.map((task) => task.id)
        );

        // TODO: save only when tasks are not empty
        await insertTasks(tasks);

        res.status(200).json(tasks);
      } catch (e) {
        // TODO: improve error handling and logging
        //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
        logger.log("Route:/export/saveToDb - Error: ", e);
        res.status(500).json({
          error: {
            message: (e as Error).message,
          },
        });
      }
    },
);
