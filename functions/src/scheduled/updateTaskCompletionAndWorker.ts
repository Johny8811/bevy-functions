import { logger } from "firebase-functions";

import { todayTasks } from "../integrations/onFleet/filters/todayTasks";
import { getAllTasks } from "../integrations/onFleet/getAllTasks";
import { updateTaskByIdMidnightFields } from "../routers/tasks/db";

export const updateTaskCompletionAndWorker = async () => {
  try {
    const filter = todayTasks();
    const onFleetTasks = await getAllTasks(filter);
    const exportedTasksIds = onFleetTasks.map((t) => t.id);

    logger.log("updateTaskCompletionAndWorker:exportedTasksIds: ", exportedTasksIds);

    const updateResult = await Promise.all(onFleetTasks.map((task) =>
      updateTaskByIdMidnightFields(task)
    ));

    const matchedCount = updateResult.map((r) => r.matchedCount);
    const modifiedCounts = updateResult.map((r) => r.modifiedCount);

    logger.log("updateTaskCompletionAndWorker:matchedCount:  ", matchedCount);
    logger.log("updateTaskCompletionAndWorker:modifiedCounts:  ", modifiedCounts);
  } catch (e) {
    logger.log("updateTaskCompletionAndWorker:Error:  ", e);
  }
};
