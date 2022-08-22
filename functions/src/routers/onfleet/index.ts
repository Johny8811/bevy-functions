import { logger } from "firebase-functions";
import * as express from "express";

import { getAllTasks } from "../../integrations/onFleet/getAllTasks";
import { getNextDayTimeValues } from "../utils";

import { insertTasks } from "./db";

export const onFleetRouter = express.Router();

onFleetRouter.get(
    "/export/saveToDb",
    async (req, res) => {
      try {
        const timeValues = getNextDayTimeValues();
        const tasks = await getAllTasks(timeValues);

        logger.log(
            "Prepared tasks ids for next day: ",
            tasks.map((task) => task.id)
        );

        if (tasks.length > 0) {
          await insertTasks(tasks);
        }

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
