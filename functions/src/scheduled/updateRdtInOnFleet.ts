import { logger } from "firebase-functions";

import { findTasksByIDs } from "../database/db";
import { onFleetApi } from "../integrations/onFleet";
import { tomorrowTasks } from "../integrations/onFleet/filters/tomorrowTasks";
import { getAllTasks } from "../integrations/onFleet/getAllTasks";


export const updateRdtInOnFleet = async (initTimestamp: number) => {
  try {
    const filter = tomorrowTasks(initTimestamp);
    const onFleetTasks = await getAllTasks(filter);
    const exportedTasksIds = onFleetTasks.map((t) => t.id);

    logger.log(
        "updateRdtInOnFleet:exportedTasksIds: ",
        JSON.stringify(onFleetTasks.map((t) => t.shortId))
    );

    const databaseTasks = await findTasksByIDs(exportedTasksIds);
    logger.log("updateRdtInOnFleet: databaseTasks: ", databaseTasks.map((v) => v.shortId));

    const result = await Promise.all(databaseTasks.map((task) =>
      onFleetApi.tasks.update(task.id, {
        completeAfter: task.slot?.start,
        completeBefore: task.slot?.end,
      })
    ));

    logger.log("updateRdtInOnFleet: updated RDT by slot - tasks IDs: ", result.map((v) => v.shortId));
  } catch (e) {
    logger.log("updateRdtInOnFleet:Error:  ", e);
  }
};
