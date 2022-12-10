import { logger } from "firebase-functions";

import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";
import { withApiAuthorization } from "../../middlewares/withApiAuthorization";
import { generateKey } from "../utils/generateKey";
import { client } from "../../integrations/postgresql";

export const api = withCors(withApiAuthorization(async (req, res) => {
  try {
    const tasks = JSON.parse(req.body);

    // TODO: 1. validate
    // TODO: 2. check if batch exist
    // TODO: 3. upload to batches order
    // TODO: 4. upload to orders

    res.status(201).json(tasks);
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
    const carrierEmail = req.query.email && String(req.query.email);
    const generatedKey = generateKey();

    if (!carrierEmail) {
      res.status(400).json({ message: "Missing route query parameters 'email'" });
      return;
    }

    logger.log("carrierEmail: ", carrierEmail);

    const text = "UPDATE carriers SET api_key = $1 WHERE carriers.email = $2";
    const values = [generatedKey, carrierEmail];
    await client.query(text, values);

    res.status(201).json({ message: "success" });
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("generateApiKey: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
