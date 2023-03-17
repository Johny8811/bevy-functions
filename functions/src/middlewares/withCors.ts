// https://gist.github.com/mediavrog/49c4f809dffea4e00738a7f5e3bbfa59?permalink_comment_id=3400965#gistcomment-3400965
import * as functions from "firebase-functions";
import cors from "cors";
import { RuntimeOptions } from "firebase-functions";

const corsMiddleware = cors({ origin: true });

export type FunctionHandler = (
  req: functions.https.Request,
  res: functions.Response,
) => void | Promise<void>;

export const withCors = (
    handler: FunctionHandler,
    memory?: RuntimeOptions["memory"],
    regions: Parameters<typeof functions.region> = ["europe-west3"],
) =>
  functions.runWith({ memory: memory || "256MB" }).region(...regions).https.onRequest((req, res) =>
    corsMiddleware(req, res, () => {
      handler(req, res);
    })
  );
