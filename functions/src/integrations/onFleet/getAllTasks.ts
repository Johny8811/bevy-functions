import {
  OnfleetTask,
  TaskQueryParam,
} from "@onfleet/node-onfleet/Resources/Tasks";

import { onFleetApi } from "./";
import { logger } from "firebase-functions";

export const getAllTasks = async (params: TaskQueryParam) => {
  let allTasks: OnfleetTask[] = [];

  /**
   * recursively get all tasks
   * @param {TaskQueryParam} innerParams
   */
  await (async function getTasks(innerParams: TaskQueryParam) {
    const {
      tasks,
      lastId: currentLastId,
    } = await onFleetApi.tasks.get(innerParams);
    allTasks = [...allTasks, ...tasks];

    logger.log("AllTasks: ", allTasks.length);

    if (currentLastId) {
      await getTasks({ ...innerParams, lastId: currentLastId });
      return;
    }
  })(params);

  return allTasks;
};
