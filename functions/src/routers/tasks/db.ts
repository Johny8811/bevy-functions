import { client } from "../../integrations/mongodb";
import { OurOnFleetTask } from "../../types/tasks";
import { tomorrowTasks as tomorrowTasksFilter } from "../../integrations/onFleet/filters/tomorrowTasks";
import { add, getTime } from "date-fns";
import { logger } from "firebase-functions";

import { DEVELOPMENT } from "../../constants";

const tasksCollection = client
    .db(DEVELOPMENT ? "dev_on_fleet" : "on_fleet")
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

export const findTasksByDate = (date: string) => {
  const completeAfterAfter = getTime(new Date(date));
  const completeBeforeBefore = getTime(add(completeAfterAfter, { days: 1 }));

  logger.log("tasksDb:getTasksByDate: ", { date, completeAfterAfter, completeBeforeBefore });

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

