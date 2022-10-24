import { logger } from "firebase-functions";

import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";
import { onFleetApi } from "../../integrations/onFleet";
import { tomorrowTasks } from "../../integrations/onFleet/filters/tomorrowTasks";
import { getAllTasks } from "../../integrations/onFleet/getAllTasks";

import { generateOrderForTasks } from "../utils/generateTaskOrder";
import { filterOnFleetExportByDbTasks } from "../utils/filterOnFleetExportByDbTasks";
import { generateHourlyTimeSlot } from "../utils/generateHourlyTimeSlot";
import { findTasksByIDs, insertTasks, updateTask } from "../tasks/db";


// TODO: route has to be under role access
/**
 * Fetch onFleet tasks planned for next day and save them to tasks database
 */
export const exportTasksToDb = withCors(withAuthorization(async (req, res) => {
  try {
    const filter = tomorrowTasks();
    const onFleetTasks = await getAllTasks(filter);
    const exportedTasksIds = onFleetTasks.map((t) => t.id);

    logger.log(
        "Route:/onFleet/export/saveToDb - Prepared tasks ids for tomorrow: ",
        onFleetTasks.map((t) => t.shortId),
        " count: ", exportedTasksIds.length
    );

    if (onFleetTasks.length > 0) {
      const databaseTasks = await findTasksByIDs(exportedTasksIds);
      const tasksWithOrder = generateOrderForTasks(onFleetTasks);
      const ourOnFleetTasks = tasksWithOrder.map((t) => ({ ...t, slot: generateHourlyTimeSlot(t) }));

      const { newTasks, updatedTasks } = filterOnFleetExportByDbTasks(ourOnFleetTasks, databaseTasks);

      logger.log("Route:/onFleet/export/saveToDb - new tasks ids: ", newTasks.map((t) => t.shortId));
      logger.log("Route:/onFleet/export/saveToDb - updated tasks ids: ",
          updatedTasks.map((t) => t.shortId)
      );

      if (newTasks.length > 0) {
        await insertTasks(newTasks);
      }

      if (updatedTasks.length > 0) {
        await Promise.all(updatedTasks.map((task) => updateTask(task)));
      }

      res.status(200).json(ourOnFleetTasks);
    } else {
      res.status(200).json([]);
    }
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("Route:/onFleet/export/saveToDb - Error: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
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
    logger.log("Route:/onFleet/export/saveToDb - Error: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
