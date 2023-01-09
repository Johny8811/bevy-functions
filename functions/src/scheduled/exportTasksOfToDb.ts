import { logger } from "firebase-functions";
import * as functions from "firebase-functions";

import { exportTasksToDbMethod } from "../functions/onFleet";

export const midnightExportTasksToDb = functions
    .region("europe-west3")
    .pubsub
    .schedule("58 23 * * *")
    .timeZone("Europe/Prague")
    .onRun(async () => {
      try {
        logger.log("exportTasksOfToDb:job");

        await exportTasksToDbMethod((tasks) => {
          logger.log("exportTasksOfToDb:job - tasks: ", tasks);
        }, (e) => {
          logger.log("exportTasksOfToDb:job - error: ", e);
        });
      } catch (e) {
        logger.log("updateRdtInOnFleet:Error:  ", e);
      }
    });
