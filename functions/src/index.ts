import { logger, pubsub } from "firebase-functions";
import "dotenv/config";
import { getTime } from "date-fns";

import * as onFleetFunctions from "./routes/onFleet";
import * as tasksFunctions from "./routes/tasks";
import * as userFunctions from "./routes/user";
import { updateCompletionAndWorker } from "./scheduled/updateCompletionAndWorker";
import { updateRdtInOnFleet } from "./scheduled/updateRdtInOnFleet";

export const onFleet = onFleetFunctions;
export const tasks = tasksFunctions;
export const user = userFunctions;

export const midnightTasksUpdateJob = pubsub
    .schedule("59 23 * * *")
    .timeZone("Europe/Prague")
    .onRun(async (context) => {
      logger.log("midnightTasksUpdateJob:context ", context);

      const timestamp = getTime(new Date(context.timestamp));
      updateCompletionAndWorker(timestamp);
      updateRdtInOnFleet(timestamp);

      return null;
    });
