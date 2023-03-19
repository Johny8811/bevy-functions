import Ajv from "ajv";
import { logger } from "firebase-functions";

import { withCors } from "../../../middlewares/withCors";
import { withApiAuthorization } from "../../../middlewares/withApiAuthorization";

import { insertBatch, Task } from "../../../database/tasks_api_db";
import { tasksArraySchema } from "./tasksArraySchema";

const schemaValidator = new Ajv();

export const addJobOrders = withCors(withApiAuthorization(async (req, res) => {
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
    res.status(200).json({ message: "success" });
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("api: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
