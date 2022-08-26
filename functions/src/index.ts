import { https } from "firebase-functions";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { tasksRouter } from "./routers/tasks";
import { authorizeUser } from "./middleware/authorizeUser";

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.use(authorizeUser);
app.use(tasksRouter);

export const tasks = https.onRequest(app);
