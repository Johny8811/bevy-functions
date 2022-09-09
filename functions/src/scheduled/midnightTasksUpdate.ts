import { logger } from "firebase-functions";

import { updateTaskByIdMidnightFields } from "../routers/tasks/db";
import { getAllTasks as onFleetGetAllTasks } from "../integrations/onFleet/getAllTasks";
import { todayTasks as todayTasksFilter } from "../integrations/onFleet/filters/todayTasks";

export const midnightTasksUpdate = async () => {
  const filter = todayTasksFilter();
  const onFleetTasks = await onFleetGetAllTasks(filter);
  const exportedTasksIds = onFleetTasks.map((t) => t.id);

  logger.log("midnightTasksUpdate:exportedTasksIds: ", exportedTasksIds);

  onFleetTasks.forEach((task) => {
    updateTaskByIdMidnightFields(task);
  });
};

