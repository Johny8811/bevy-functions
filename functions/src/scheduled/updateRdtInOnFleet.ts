import { logger } from "firebase-functions";

import { findTasksByIDs } from "../functions/tasks/db";
import { onFleetApi } from "../integrations/onFleet";
import { tomorrowTasks } from "../integrations/onFleet/filters/tomorrowTasks";
import { getAllTasks } from "../integrations/onFleet/getAllTasks";


export const updateRdtInOnFleet = async (initTimestamp: number) => {
  try {
    const filter = tomorrowTasks(initTimestamp);
    const onFleetTasks = await getAllTasks(filter);
    const exportedTasksIds = onFleetTasks.map((t) => t.id);

    logger.log("updateRdtInOnFleet:exportedTasksIds: ", onFleetTasks.map((t) => t.shortId));

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
