import { GetTaskResult } from "@onfleet/node-onfleet/Resources/Tasks";
import { isEqual } from "date-fns";

const initState = {
  updatedTasks: [],
  newTasks: [],
};

type Result = {
  updatedTasks: GetTaskResult[],
  newTasks: GetTaskResult[],
};

// TODO: test
export const filterOnFleetExportByDbTasks = (onFleetTasks: GetTaskResult[], databaseTasks: GetTaskResult[]) =>
  onFleetTasks.reduce<Result>((total, onFleetTask) => {
    const dbFoundTask = databaseTasks.find((t) => t.id === onFleetTask.id);
    const isSame = dbFoundTask && isEqual(dbFoundTask.timeLastModified, onFleetTask.timeLastModified);

    if (!dbFoundTask) {
      return {
        ...total,
        newTasks: [...total.newTasks, onFleetTask],
      };
    }

    if (!isSame) {
      return {
        ...total,
        updatedTasks: [...total.updatedTasks, onFleetTask],
      };
    }

    return { ...total };
  }, initState);

