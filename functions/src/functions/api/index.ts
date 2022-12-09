import { logger } from "firebase-functions";

import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";
import { generateKey } from "../utils/generateKey";

export const api = withCors(withAuthorization(async (req, res) => {
  try {
    // const tasks = JSON.parse(req.body);

    // logger.log("tasks: ", tasks);
    res.status(201).json(["test"]);
    // TODO: save to DB
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("api: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));

export const generateApiKey = withCors(withAuthorization(async (req, res) => {
  try {
    console.log(generateKey());

    res.status(201).json(["test"]);
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("generateApiKey: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
