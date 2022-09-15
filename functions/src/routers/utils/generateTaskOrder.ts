import { groupBy } from "lodash";

import { OriginOnFleetTask } from "../../types/tasks";
import { HelperTask } from "../types";
import { sortByWorkerAndEat } from "./sortByWorkerAndEat";

type GroupedByUserAndWorker = {
  [u: string]: {
    [w: string]: HelperTask[]
  }
}

export const generateOrderForTasks = (onFleetTasks: OriginOnFleetTask[]) => {
  const helperTasks: HelperTask[] = onFleetTasks
      .map(({ id, worker, estimatedArrivalTime, metadata }) => ({
        id,
        worker,
        estimatedArrivalTime,
        userId: metadata.find((d) => d.name === "User ID")?.value,
      }))
      .filter((t): t is HelperTask =>
        t.userId && t.worker && t.estimatedArrivalTime
      );

  // TODO: is it possible to improve typing to remove type assertions?
  const sortedHelperTasks = sortByWorkerAndEat(helperTasks) as HelperTask[];

  const groupedByUser = groupBy(sortedHelperTasks, "userId");
  const groupedByUserAndWorker = Object.keys(groupedByUser).reduce<GroupedByUserAndWorker>((total, key) => ({
    ...total,
    [key]: groupBy(groupedByUser[key], "worker"),
  }), {});

  return onFleetTasks.map((onFleetTask) => {
    const userId = onFleetTask.metadata.find((d) => d.name === "User ID")?.value;
    const { worker } = onFleetTask;

    if (userId && worker) {
      const workerTasks = groupedByUserAndWorker[userId][worker];
      const taskIndex = workerTasks ? workerTasks.findIndex((t) => t.id === onFleetTask.id) + 1 : null;

      return {
        ...onFleetTask,
        order: taskIndex,
      };
    }

    // TODO: create util for this and use it above too
    return { ...onFleetTask, order: null };
  });
};
