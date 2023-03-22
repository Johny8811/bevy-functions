import { logger } from "firebase-functions";

import { todayTasks } from "../integrations/onFleet/filters/todayTasks";
import { getAllTasks } from "../integrations/onFleet/getAllTasks";
import { updateCompletionAndWorkerByTaskId } from "../database/tasks_db";

export const updateCompletionAndWorker = async (initTimestamp: number) => {
  try {
    const filter = todayTasks({ initTimestamp });
    const onFleetTasks = await getAllTasks(filter);
    const exportedTasksIds = onFleetTasks.map((t) => t.shortId);

    logger.log("updateTaskCompletionAndWorker:exportedTasksIds: ", JSON.stringify(exportedTasksIds));

    const updateResult = await Promise.all(onFleetTasks.map((task) =>
      updateCompletionAndWorkerByTaskId(task)
    ));

    const matchedCount = updateResult.map((r) => r.matchedCount);
    const modifiedCounts = updateResult.map((r) => r.modifiedCount);

    logger.log("updateTaskCompletionAndWorker:matchedCount:  ", matchedCount);
    logger.log("updateTaskCompletionAndWorker:modifiedCounts:  ", modifiedCounts);
  } catch (e) {
    logger.log("updateTaskCompletionAndWorker:Error:  ", e);
  }
};
