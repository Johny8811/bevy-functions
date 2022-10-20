import { logger, pubsub } from "firebase-functions";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getTime } from "date-fns";

import { authorizeUser } from "./middlewares/authorizeUser";
import * as tasksFunctions from "./routes/tasks";
import * as userFunctions from "./routes/user";
import { updateCompletionAndWorker } from "./scheduled/updateCompletionAndWorker";
import { updateRdtInOnFleet } from "./scheduled/updateRdtInOnFleet";

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.use(authorizeUser);

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
