import { logger } from "firebase-functions";
import Ajv from "ajv";

import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";
import { withApiAuthorization } from "../../middlewares/withApiAuthorization";
import { client } from "../../integrations/postgresql";
import { generateKey } from "../utils/generateKey";
import {
  insertBatch,
  Task,
} from "../tasks/all_tasks_db";
import { tasksArraySchema } from "./tasksArraySchema";

const schemaValidator = new Ajv();

export const uploadOrdersBatch = withCors(withApiAuthorization(async (req, res) => {
  try {
    const tasks: Task[] = JSON.parse(req.body);

    const tasksSchemaValidator = schemaValidator.compile(tasksArraySchema);
    const valid = tasksSchemaValidator(tasks);

    if (!valid) {
      logger.log("Route:/bevy-api - validation errors: ", tasksSchemaValidator.errors);
      res.status(400).json(tasksSchemaValidator.errors);
      return;
    }

    await insertBatch(tasks);
    res.status(201).json(tasks);
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
