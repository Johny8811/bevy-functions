import { https, pubsub, logger } from "firebase-functions";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getTime } from "date-fns";

import { authorizeUser } from "./middleware/authorizeUser";
import { tasksRouter } from "./routers/tasks";
import { updateUserInfo } from "./routers/user";
import { updateTaskCompletionAndWorker } from "./scheduled/updateTaskCompletionAndWorker";
import { updateRdtInOnFleet } from "./scheduled/updateRdtInOnFleet";

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.use(authorizeUser);
app.use(tasksRouter);

app.put("/user/update", updateUserInfo);

// TODO: change to "tasks" to "bevy" --> route will be: tasks, user, etc.
export const tasks = https.onRequest(app);

export const midnightTasksUpdateJob = pubsub
    .schedule("59 23 * * *")
    .timeZone("Europe/Prague")
    .onRun((context) => {
      logger.log("midnightTasksUpdateJob:context ", context);

      const timestamp = getTime(new Date(context.timestamp));
      updateTaskCompletionAndWorker(timestamp);
      updateRdtInOnFleet(timestamp);

      return null;
    });
