import { isEqual } from "date-fns";

import { OurOnFleetTask } from "../../types/tasks";

const initState = {
  updatedTasks: [],
  newTasks: [],
};

type Result = {
  updatedTasks: OurOnFleetTask[],
  newTasks: OurOnFleetTask[],
};

// TODO: test
export const filterOnFleetExportByDbTasks = (ourOnFleetTasks: OurOnFleetTask[], databaseTasks: OurOnFleetTask[]) =>
  ourOnFleetTasks.reduce<Result>((total, onFleetTask) => {
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

