import { client } from "../../integrations/mongodb";
import { OurTaskResult } from "../../types/tasks";
import { filterTomorrowTasks } from "../utils/filterTomorrowTasks";
import { add, getTime } from "date-fns";
import { logger } from "firebase-functions";

const tasksCollection = client
    .db("on_fleet")
    .collection<OurTaskResult>("tasks");

export const insertTasks = (tasks: OurTaskResult[]) => tasksCollection.insertMany(
    tasks,
    { ordered: true }
);

export const updateTask = (task: OurTaskResult) => tasksCollection.updateOne(
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
  const { completeAfterAfter, completeBeforeBefore } = filterTomorrowTasks();

  logger.log("tasksDb:findTomorrowTasks: ", { completeAfterAfter, completeBeforeBefore });

  return tasksCollection.find({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
  }).toArray();
};

