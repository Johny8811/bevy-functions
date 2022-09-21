import { logger } from "firebase-functions";

import { findTasksByIDs } from "../routers/tasks/db";
import { onFleetApi } from "../integrations/onFleet";
import { tomorrowTasks } from "../integrations/onFleet/filters/tomorrowTasks";
import { getAllTasks } from "../integrations/onFleet/getAllTasks";


export const updateRdtInOnFleet = async () => {
  try {
    const filter = tomorrowTasks();
    const onFleetTasks = await getAllTasks(filter);
    const exportedTasksIds = onFleetTasks.map((t) => t.id);

    logger.log("updateRdtInOnFleet:exportedTasksIds: ", exportedTasksIds);

    const databaseTasks = await findTasksByIDs(exportedTasksIds);
    await Promise.all(databaseTasks.map((task) =>
      onFleetApi.tasks.update(task.id, {
        completeAfter: task.slot?.start,
        completeBefore: task.slot?.end,
      })
    ));
  } catch (e) {
    logger.log("updateRdtInOnFleet:Error:  ", e);
  }
};
