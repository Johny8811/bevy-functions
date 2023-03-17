import { logger } from "firebase-functions";
import { OnfleetMetadata } from "@onfleet/node-onfleet/metadata";

import { getValueByParameterName, hasRole } from "../../integrations/firebase/remoteConfig";
import { RemoteConfigParameters } from "../../integrations/firebase/types";
import { TaskMetadata } from "../../types/tasks";
import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";
import { sortByWorkerAndEat } from "../utils/sortByWorkerAndEat";
import { mapTaskDataToCreateTasksProps } from "../utils/mapTasksToCreateTasksProps";

import {
  findTasksByDateAndUserId,
  findTasksByDateRage,
  findTomorrowTasks,
  findTodayTasks,
  findYesterdayTasks,
  aggregateTasks,
} from "./db";
import { onFleetApi } from "../../integrations/onFleet";
import { SKIP_AUTH } from "../../constants";

// https://stackoverflow.com/questions/57771798/how-do-i-jsdoc-parameters-to-web-request
/**
 * Get tasks by "date" || "date & userId"
 *
 * @typedef {object} getTasksRequestQuery
 * @property {string} completeAfter the date after which tasks should be completed
 * @property {string} completeBefore the date before which tasks should be completed
 *
 * @param {import('express').Request<{}, {}, {}, getTasksRequestQuery>} req
 * @param {import('express').Response} res
 */
export const getTasks = withCors(withAuthorization(async (req, res) => {
  logger.log("tasks-getTasks - query parameters: ", req.query);

  const completeAfter = req.query.completeAfter && String(req.query.completeAfter);
  const completeBefore = req.query.completeBefore && String(req.query.completeBefore);
  const userId = req.user?.uid;

  try {
    const usersRolesStr = await getValueByParameterName(RemoteConfigParameters.USERS_ROLES);
    const usersRoles = usersRolesStr ? JSON.parse(usersRolesStr) : {};
    const roles = usersRoles[userId];

    logger.log("tasks-getTasks - user roles: ", roles);

    if (!completeAfter) {
      res.status(400).json({ message: "Missing route query parameters 'completeAfter'" });
      return;
    }

    if (SKIP_AUTH) {
      const tasks = await findTasksByDateRage(completeAfter, completeBefore);
      res.status(200).json(tasks);
      return;
    }

    if (hasRole(roles, "root")) {
      const tasks = await findTasksByDateRage(completeAfter, completeBefore);
      res.status(200).json(tasks);
      return;
    }

    if (hasRole(roles, "user")) {
      const tasks = await findTasksByDateAndUserId(completeAfter, userId);
      const sortedTasks = sortByWorkerAndEat(tasks);
      res.status(200).json(sortedTasks);
      return;
    }

    res.status(403).json({ message: "Permission denied" });
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("tasks-getTasks - Error: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}), "512MB");

/**
 * @property {string} dayName yesterday, today, tomorrow
 *
 * @param {import('express').Request<{}, {}, {}, getTasksRequestQuery>} req
 * @param {import('express').Response} res
 */
export const getTasksByDayName = withCors(withAuthorization(async (req, res) => {
  logger.log("tasks-getTasksByDayName - query parameters: ", req.query);

  const dayName = req.query.dayName && String(req.query.dayName);

  try {
    if (dayName === "yesterday") {
      const tasks = await findYesterdayTasks();
      res.status(200).json(tasks);
      return;
    }

    if (dayName === "today") {
      const tasks = await findTodayTasks();
      res.status(200).json(tasks);
      return;
    }

    if (dayName === "tomorrow") {
      const tasks = await findTomorrowTasks();
      res.status(200).json(tasks);
      return;
    }
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("tasks-getTasksByDayName - Error: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));


export const getAggregatedTasks = withCors(withAuthorization(async (req, res) => {
  const completeAfter = req.query.completeAfter && String(req.query.completeAfter);
  const completeBefore = req.query.completeBefore && String(req.query.completeBefore);

  try {
    if (!completeAfter || !completeBefore) {
      res.status(400).json({ message: "Missing route query parameters 'completeAfter' & 'completeBefore'" });
      return;
    }

    logger.log({ completeAfter, completeBefore });

    const tasks = await aggregateTasks(completeAfter, completeBefore);

    res.status(201).json(tasks);
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("tasks-getAggregatedTasks: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));

/**
 * Create tasks in batch in some fleet system , e.g. OnFleet
 *
 * body:
 * - tasks - array of objects of tasks, that will be created
 */
export const batchCreate = withCors(withAuthorization(async (req, res) => {
  try {
    const tasks = JSON.parse(req.body);

    const metadata: OnfleetMetadata[] = [
      {
        name: TaskMetadata.UserId,
        type: "string",
        visibility: ["api"],
        value: req.user.uid,
      },
    ];

    const createTasksProps = mapTaskDataToCreateTasksProps(tasks, metadata);
    logger.log("tasks-batchCreate:createTasksProps ", JSON.stringify(createTasksProps));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await onFleetApi.tasks.batchCreate({ tasks: createTasksProps });

    res.status(201).json(result);
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("tasks-batchCreate: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
