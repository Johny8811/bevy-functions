import { TaskQueryParam } from "@onfleet/node-onfleet/Resources/Tasks";

import { OriginOnFleetTask } from "../../types/tasks";
import { onFleetApi } from "./";
import { logger } from "firebase-functions";

export const getAllTasks = async (params: TaskQueryParam) => {
  let allTasks: OriginOnFleetTask[] = [];

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
    // FIXME: investigate onFleet types, module "@onfleet/node-onfleet" has bad type coverage of onFleet api
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
