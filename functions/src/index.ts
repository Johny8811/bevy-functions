import { https, logger } from "firebase-functions";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { onFleetRouter } from "./routers/onfleet";

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  logger.log("Server is running.");
  res.send("Server is running.");
});

app.use("/tasks", onFleetRouter);

export const onFleet = https.onRequest(app);
