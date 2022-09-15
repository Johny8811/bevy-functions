import { groupBy } from "lodash";

import { OriginOnFleetTask } from "../../types/tasks";
import { HelperTask } from "../types";

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
      )
      .sort((a, b) => {
        if (a.worker && b.worker && a.estimatedArrivalTime && b.estimatedArrivalTime) {
          const res = a.worker.localeCompare(b.worker);
          if (res !== 0) {
            return res;
          }

          return a.estimatedArrivalTime - b.estimatedArrivalTime;
        }

        return 0;
      });

  const groupedByUser = groupBy(helperTasks, "userId");
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
