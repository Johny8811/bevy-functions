import { OnfleetTask } from "@onfleet/node-onfleet/Resources/Tasks";
import { isEqual } from "date-fns";

const initState = {
  updatedTasks: [],
  newTasks: [],
};

type Result = {
  updatedTasks: OnfleetTask[],
  newTasks: OnfleetTask[],
};

// TODO: test
export const filterOnFleetExportByDbTasks = (onFleetTasks: OnfleetTask[], databaseTasks: OnfleetTask[]) =>
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

