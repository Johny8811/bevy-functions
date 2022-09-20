import { logger } from "firebase-functions";

import { findTasksByIDs, updateTaskByIdMidnightFields } from "../routers/tasks/db";
import { getAllTasks as onFleetGetAllTasks } from "../integrations/onFleet/getAllTasks";
import { todayTasks as todayTasksFilter } from "../integrations/onFleet/filters/todayTasks";
import { onFleetApi } from "../integrations/onFleet";

// TODO: maybe separate into more independent functions
export const midnightTasksUpdate = async () => {
  try {
    const filter = todayTasksFilter();
    const onFleetTasks = await onFleetGetAllTasks(filter);
    const exportedTasksIds = onFleetTasks.map((t) => t.id);

    logger.log("midnightTasksUpdate:exportedTasksIds: ", exportedTasksIds);


    const updateResult = await Promise.all(onFleetTasks.map((task) =>
      updateTaskByIdMidnightFields(task)
    ));

    const matchedCount = updateResult.map((r) => r.matchedCount);
    const modifiedCounts = updateResult.map((r) => r.modifiedCount);

    logger.log("midnightTasksUpdate:matchedCount:  ", matchedCount);
    logger.log("midnightTasksUpdate:modifiedCounts:  ", modifiedCounts);

    const databaseTasks = await findTasksByIDs(exportedTasksIds);
    await Promise.all(databaseTasks.map((task) =>
      onFleetApi.tasks.update(task.id, {
        completeAfter: task.slot?.start,
        completeBefore: task.slot?.end,
      })
    ));
  } catch (e) {
    logger.log("midnightTasksUpdate:Error:  ", e);
  }
};

