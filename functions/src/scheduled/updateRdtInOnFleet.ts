import { logger } from "firebase-functions";

import { findTasksByIDs } from "../database/tasks_db";
import { onFleetApi } from "../integrations/onFleet";
import { tomorrowTasks } from "../integrations/onFleet/filters/tomorrowTasks";
import { getAllTasks } from "../integrations/onFleet/getAllTasks";


export const updateRdtInOnFleet = async (initTimestamp: number) => {
  try {
    const filter = tomorrowTasks({ initTimestamp, origin: "updateRdtInOnFleet" });
    const onFleetTasks = await getAllTasks(filter, "updateRdtInOnFleet");
    const exportedTasksIds = onFleetTasks.map((t) => t.id);

    logger.log(
        "updateRdtInOnFleet:onFleetTasksIds: ",
        JSON.stringify(onFleetTasks.map((t) => t.shortId))
    );

    const databaseTasks = await findTasksByIDs(exportedTasksIds);
    logger.log("updateRdtInOnFleet: databaseTasks: ", databaseTasks.map((v) => v.shortId));

    databaseTasks.forEach((task) => {
      void onFleetApi
          .tasks
          .update(task.id, {
            completeAfter: task.slot?.start,
            completeBefore: task.slot?.end,
          })
          .then(() => {
            logger.log(`Success update: ${task.id} `);
          })
          .catch(() => {
            logger.log(`Success FAILED: ${task.id} `);
          });

      return task.shortId;
    });
  } catch (e) {
    logger.log("updateRdtInOnFleet:Error:  ", e);
  }
};
