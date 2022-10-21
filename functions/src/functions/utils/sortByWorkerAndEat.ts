import { OriginOnFleetTask } from "../../types/tasks";
import { HelperTask } from "../types";

export const sortByWorkerAndEat = (tasks: (OriginOnFleetTask | HelperTask)[]) =>
  // we need to bypass changing original tasks array
  [...tasks].sort((a, b) => {
    if (a.worker && b.worker) {
      const res = a.worker.localeCompare(b.worker);
      if (res !== 0) {
        return res;
      }
    }

    if (a.estimatedArrivalTime && b.estimatedArrivalTime) {
      return a.estimatedArrivalTime - b.estimatedArrivalTime;
    }

    return 0;
  });
