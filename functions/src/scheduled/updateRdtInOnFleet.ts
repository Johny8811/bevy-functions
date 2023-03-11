import { logger } from "firebase-functions";

import { findTasksByIDs } from "../functions/tasks/db";
import { onFleetApi } from "../integrations/onFleet";
import { tomorrowTasks } from "../integrations/onFleet/filters/tomorrowTasks";
import { getAllTasks } from "../integrations/onFleet/getAllTasks";
import { TaskMetadata } from "../types/tasks";


export const updateRdtInOnFleet = async (initTimestamp: number) => {
  try {
    const filter = tomorrowTasks(initTimestamp);
    const tomorrowOnFleetTasks = await getAllTasks(filter);
    const filteredOldPortalOFTasks = tomorrowOnFleetTasks.filter((t) =>
      t.metadata.find((m) => m.name === TaskMetadata.UserId)
    );

    const exportedTasksIds = filteredOldPortalOFTasks.map((t) => t.id);

    logger.log(
        "updateRdtInOnFleet:exportedTasksIds: ",
        JSON.stringify(filteredOldPortalOFTasks.map((t) => t.shortId))
    );

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
