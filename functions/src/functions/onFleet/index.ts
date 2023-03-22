import { logger } from "firebase-functions";

import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";
import { onFleetApi } from "../../integrations/onFleet";
import { tomorrowTasks } from "../../integrations/onFleet/filters/tomorrowTasks";
import { getAllTasks } from "../../integrations/onFleet/getAllTasks";

import { generateOrderForTasks } from "../utils/generateTaskOrder";
import { filterOnFleetExportByDbTasks } from "../utils/filterOnFleetExportByDbTasks";
import { generateHourlyTimeSlot } from "../utils/generateHourlyTimeSlot";
import { findTasksByIDs, insertTasks, updateTask } from "../../database/tasks_db";
import { OurOnFleetTask } from "../../types/tasks";

export const exportTasksToDbMethod = async (
    successCb: (tasks: OurOnFleetTask[]) => void,
    errorCb: (e: Error) => void,
    origin: string
) => {
  logger.log("exportTasksToDbMethod - start | origin: ", origin);

  try {
    const filter = tomorrowTasks();
    const onFleetTasks = await getAllTasks(filter, "exportTasksToDbMethod");
    const exportedTasksIds = onFleetTasks.map((t) => t.id);

    logger.log(
        " count: ", exportedTasksIds.length,
        "exportTasksToDbMethod - Prepared tasks ids for tomorrow: ",
        JSON.stringify(onFleetTasks.map((t) => t.shortId))
    );

    if (onFleetTasks.length > 0) {
      const databaseTasks = await findTasksByIDs(exportedTasksIds);
      const tasksWithOrder = generateOrderForTasks(onFleetTasks);
      const ourOnFleetTasks = tasksWithOrder.map((t) => ({ ...t, slot: generateHourlyTimeSlot(t) }));

      const { newTasks, updatedTasks } = filterOnFleetExportByDbTasks(ourOnFleetTasks, databaseTasks);

      logger.log(
          " count: ", newTasks.length,
          " | exportTasksToDbMethod - new tasks ids: ",
          JSON.stringify(newTasks.map((t) => t.shortId))
      );
      logger.log(
          " count: ", updatedTasks.length,
          " | exportTasksToDbMethod - updated tasks ids: ",
          JSON.stringify(updatedTasks.map((t) => t.shortId))
      );

      if (newTasks.length > 0) {
        await insertTasks(newTasks);
      }

      if (updatedTasks.length > 0) {
        await Promise.all(updatedTasks.map((task) => updateTask(task)));
      }

      successCb(ourOnFleetTasks);
    } else {
      successCb([]);
    }
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("exportTasksToDbMethod - Error: ", e);
    errorCb(e as Error);
  }
};

// TODO: route has to be under role access
/**
 * Fetch onFleet tasks planned for next day and save them to tasks database
 */
export const exportTasksToDb = withCors(withAuthorization(async (req, res) => {
  await exportTasksToDbMethod(
      (tasks) => {
        res.status(200).json(tasks);
      },
      (e) => {
        res.status(500).json({ message: (e as Error).message });
      }, "'onFleet - export tasks' - BUTTON");
}));

/**
 * Get list of workers
 *
 * queryParams:
 * - filter - A comma-separated list of fields to return, if all are not desired.
 */
export const getWorkers = withCors(withAuthorization(async (req, res) => {
  try {
    const filter = req.query.filter && String(req.query.filter);

    const result = await onFleetApi.workers.get("", {
      filter,
    });
    res.status(200).json(result);
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("function-getWorkers - Error: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
