import { logger, pubsub } from "firebase-functions";
import "dotenv/config";
import { getTime } from "date-fns";

import * as onFleetFunctions from "./functions/onFleet";
import * as tasksFunctions from "./functions/tasks";
import * as userFunctions from "./functions/user";
import * as apiFunctions from "./functions/api";

import { updateCompletionAndWorker } from "./scheduled/updateCompletionAndWorker";
import { updateRdtInOnFleet } from "./scheduled/updateRdtInOnFleet";
import * as rohlikFunctions from "./scheduled/rohlik";
import * as tasksJobsFunctions from "./scheduled/exportTasksOfToDb";

export const onFleet = onFleetFunctions;
export const tasks = tasksFunctions;
export const user = userFunctions;
export const rohlik = rohlikFunctions;
// midnight export of tasks
export const tasksJobs = tasksJobsFunctions;
// API
export const api = apiFunctions;

// TODO:
//  - split into multiple functions
//  - change region to Europe - inspiration rohlik functions
export const midnightTasksUpdateJob = pubsub
    .schedule("55 23 * * *")
    .timeZone("Europe/Prague")
    .onRun(async (context) => {
      logger.log("midnightTasksUpdateJob:context ", context);

      const timestamp = getTime(new Date(context.timestamp));
      await updateCompletionAndWorker(timestamp);
      await updateRdtInOnFleet(timestamp);

      return null;
    });
