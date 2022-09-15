import { OriginOnFleetTask } from "../../types/tasks";
import { HelperTask } from "../types";

export const sortByWorkerAndEat = (tasks: (OriginOnFleetTask | HelperTask)[]) =>
  // we need to bypass changing origin tasks array
  [...tasks].sort((a, b) => {
    if (a.worker && b.worker && a.estimatedArrivalTime && b.estimatedArrivalTime) {
      const res = a.worker.localeCompare(b.worker);
      if (res !== 0) {
        return res;
      }

      return a.estimatedArrivalTime - b.estimatedArrivalTime;
    }

    return 0;
  });
