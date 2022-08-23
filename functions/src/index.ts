import { https, logger } from "firebase-functions";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { tasksRouter } from "./routers/tasks";

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  logger.log("Server is running.");
  res.send("Server is running.");
});

app.use(tasksRouter);

export const tasks = https.onRequest(app);
