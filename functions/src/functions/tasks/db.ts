import { logger } from "firebase-functions";
import { add, getTime } from "date-fns";

import { OurOnFleetTask } from "../../types/tasks";
import { tomorrowTasks as tomorrowTasksFilter } from "../../integrations/onFleet/filters/tomorrowTasks";
import { client } from "../../integrations/mongodb";

const tasksCollection = client
    .db("on_fleet")
    .collection<OurOnFleetTask>("tasks");

export const insertTasks = (tasks: OurOnFleetTask[]) => tasksCollection.insertMany(
    tasks,
    { ordered: true }
);

export const updateTask = (task: OurOnFleetTask) => tasksCollection.updateOne(
    { id: task.id },
    {
      $set: {
        ...task,
      },
    },
);

export const findTasksByIDs = (ids: string[]) => tasksCollection
    .find({
      id: { $in: ids },
    })
    .toArray();

export const findTasksByDateRage = (completeAfter: string, completeBefore?: string) => {
  const completeAfterAfter = getTime(new Date(completeAfter));
  const completeBeforeBefore = getTime(completeBefore
    ? new Date(completeBefore)
    : add(completeAfterAfter, { days: 1 })
  );

  logger.log("tasksDb:getTasksByDate: ", { completeAfter, completeBefore, completeAfterAfter, completeBeforeBefore });

  return tasksCollection.find({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
  }).toArray();
};

export const findTasksByDateAndUserId = (date: string, userId: string) => {
  const completeAfterAfter = getTime(new Date(date));
  const completeBeforeBefore = getTime(add(completeAfterAfter, { days: 1 }));

  logger.log("tasksDb:getTasksByDateAndUserId: ", { date, userId, completeAfterAfter, completeBeforeBefore });

  return tasksCollection.find({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
    metadata: {
      $elemMatch: {
        value: userId,
      },
    },
  }).toArray();
};

export const findTomorrowTasks = () => {
  const { completeAfterAfter, completeBeforeBefore } = tomorrowTasksFilter();

  logger.log("tasksDb:findTomorrowTasks: ", { completeAfterAfter, completeBeforeBefore });

  return tasksCollection.find({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
  }).toArray();
};

export const updateCompletionAndWorkerByTaskId = (task: Omit<OurOnFleetTask, "slot" | "order">) =>
  tasksCollection.updateOne(
      { id: task.id },
      {
        $set: {
          worker: task.worker,
          completionDetails: task.completionDetails,
        },
      }
  );

