import * as functions from "firebase-functions";
import cors from "cors";

const corsMiddleware = cors({ origin: true });

export type FunctionHandler = (
  req: functions.https.Request,
  res: functions.Response,
) => void | Promise<void>;

export const withMiddleware = (
    handler: FunctionHandler,
    regions: Parameters<typeof functions.region> | string = ["europe-west3"],
) =>
  functions.region(...regions).https.onRequest((req, res) =>
    corsMiddleware(req, res, () => {
      handler(req, res);
    })
  );
