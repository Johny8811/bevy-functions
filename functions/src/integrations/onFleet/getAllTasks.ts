import {
  GetTaskResult,
  TaskQueryParam,
} from "@onfleet/node-onfleet/Resources/Tasks";

import { onFleetApi } from "./";
import { logger } from "firebase-functions";

export const getAllTasks = async (params: TaskQueryParam) => {
  let allTasks: GetTaskResult[] = [];

  // SECURITY FEATURE - if something broke, functions will iterate only 100 times
  // onFleet get return 64 items in page. 100 * 64 = 6400 tasks
  const iterationLimit = 80;
  let iteration = 0;

  /**
   * recursively get all tasks
   * @param {TaskQueryParam} innerParams
   */
  await (async function getTasks(innerParams: TaskQueryParam) {
    const { tasks, lastId: currentLastId } = await onFleetApi.tasks.get(innerParams);
    allTasks = [...allTasks, ...tasks];

    logger.log(`getAllTasks - iteration ${allTasks.length}, iteration: ${iteration}`);

    if (currentLastId && iteration <= iterationLimit ) {
      iteration++;
      await getTasks({ ...innerParams, lastId: currentLastId });
      return;
    }
  })(params);

  return allTasks;
};
