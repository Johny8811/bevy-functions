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
        logger.log("exportTasksToDb:JOB - start");

        await exportTasksToDbMethod((tasks) => {
          logger.log("exportTasksToDb:JOB - tasks: ", tasks);
        }, (e) => {
          logger.log("exportTasksToDb:JOB - error: ", e);
        }, "midnight exportTasks - JOB");
      } catch (e) {
        logger.log("updateRdtInOnFleet:Error:  ", e);
      }
    });
