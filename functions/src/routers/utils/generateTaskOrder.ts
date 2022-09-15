import { groupBy } from "lodash";

import { OriginOnFleetTask, TaskMetadata } from "../../types/tasks";
import { HelperTask } from "../types";
import { sortByWorkerAndEat } from "./sortByWorkerAndEat";
import { getMetadataValueByName } from "./getMetadataValueByName";

type GroupedByUserAndWorker = {
  [u: string]: {
    [w: string]: HelperTask[]
  }
}

const addOrderField = (task: OriginOnFleetTask, order: number | null = null) => ({
  ...task,
  order,
});

export const generateOrderForTasks = (onFleetTasks: OriginOnFleetTask[]) => {
  const helperTasks: HelperTask[] = onFleetTasks
      .map(({ id, worker, estimatedArrivalTime, metadata }) => ({
        id,
        worker,
        estimatedArrivalTime,
        userId: getMetadataValueByName(metadata, TaskMetadata.UserId),
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
    const userId = getMetadataValueByName(onFleetTask.metadata, TaskMetadata.UserId);
    const { worker } = onFleetTask;

    if (userId && worker) {
      const workerTasks = groupedByUserAndWorker[userId][worker];
      const taskIndex = workerTasks?.findIndex((t) => t.id === onFleetTask.id) + 1;

      return addOrderField(
          onFleetTask,
          taskIndex,
      );
    }

    return addOrderField(onFleetTask);
  });
};
