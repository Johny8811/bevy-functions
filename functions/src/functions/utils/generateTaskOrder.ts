import { groupBy } from "lodash";
import { logger } from "firebase-functions";

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
  logger.log("generateOrderForTasks:helperTasks ", helperTasks);

  // TODO: is it possible to improve typing to remove type assertions?
  const sortedHelperTasks = sortByWorkerAndEat(helperTasks) as HelperTask[];
  logger.log("generateOrderForTasks:sortedHelperTasks ", helperTasks);

  const groupedByUser = groupBy(sortedHelperTasks, "userId");
  logger.log("generateOrderForTasks:groupedByUser ", helperTasks);

  const groupedByUserAndWorker = Object.keys(groupedByUser).reduce<GroupedByUserAndWorker>((total, key) => ({
    ...total,
    [key]: groupBy(groupedByUser[key], "worker"),
  }), {});
  logger.log("generateOrderForTasks:groupedByUserAndWorker ", helperTasks);

  return onFleetTasks.map((onFleetTask) => {
    const userId = getMetadataValueByName(onFleetTask.metadata, TaskMetadata.UserId);
    const { worker } = onFleetTask;

    if (userId && worker) {
      const workersTasksMap = groupedByUserAndWorker[userId];
      const workerTasks = workersTasksMap && workersTasksMap[worker];
      const taskIndex = workerTasks?.findIndex((t) => t.id === onFleetTask.id);

      return addOrderField(
          onFleetTask,
          taskIndex ? taskIndex + 1 : null,
      );
    }

    return addOrderField(onFleetTask);
  });
};
