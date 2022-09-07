import { https } from "firebase-functions";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { authorizeUser } from "./middleware/authorizeUser";
import { tasksRouter } from "./routers/tasks";
import { updateUserInfo } from "./routers/user";

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.use(authorizeUser);
app.use(tasksRouter);

// TODO: analyze next evolution of app and adjust structure by results of this analysis
export const tasks = https.onRequest(app);
export const user = https.onRequest(updateUserInfo);
