import { logger } from "firebase-functions";
import { add, getTime } from "date-fns";

import { OurOnFleetTask } from "../types/tasks";
import { tomorrowTasks as tomorrowTasksFilter } from "../integrations/onFleet/filters/tomorrowTasks";
import { todayTasks as todayTasksFilter } from "../integrations/onFleet/filters/todayTasks";
import { yesterdayTasks as yesterdayTasksFilter } from "../integrations/onFleet/filters/yesterdayTasks";
import { client } from "../integrations/mongodb";
import { TaskQueryParam } from "@onfleet/node-onfleet/Resources/Tasks";

const tasksCollection = client
    .db("on_fleet")
    .collection<OurOnFleetTask>("tasks");

export const insertTasks = (tasks: OurOnFleetTask[]) => tasksCollection.insertMany(
    tasks,
    { ordered: true }
);

export const deleteTasks = (filter: TaskQueryParam) =>
  tasksCollection
      .deleteMany(
          {
            completeAfter: {
              $gt: filter.completeAfterAfter,
            },
            completeBefore: {
              $lt: filter.completeBeforeBefore,
            },
          }
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
  const { completeAfterAfter, completeBeforeBefore } = tomorrowTasksFilter({ origin: "findTomorrowTasks" });

  logger.log("tasksDb:findTomorrowTasks: ", { completeAfterAfter, completeBeforeBefore });

  return tasksCollection.find({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
  }).toArray();
};

export const findTodayTasks = () => {
  const { completeAfterAfter, completeBeforeBefore } = todayTasksFilter({ origin: "findTodayTasks" });

  logger.log("tasksDb:findTodayTasks: ", { completeAfterAfter, completeBeforeBefore });

  return tasksCollection.find({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
  }).toArray();
};

export const findYesterdayTasks = () => {
  const { completeAfterAfter, completeBeforeBefore } = yesterdayTasksFilter();

  logger.log("tasksDb:findYesterdayTasks: ", { completeAfterAfter, completeBeforeBefore });

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

export const aggregateTasks = (completeAfterDate: string, completeBeforeDate: string) => {
  const completeAfter = new Date(completeAfterDate).getTime();
  const completeBefore = new Date(completeBeforeDate).getTime();

  return tasksCollection
      .aggregate([
        {
          "$match": {
            "completeAfter": {
              // "$gt": 1662328800000,
              "$gt": completeAfter,
            },
            "completeBefore": {
              // "$lt": 1662674400000,
              "$lt": completeBefore,
            },
            "metadata": {
              $elemMatch: {
                value: "rJaC7Bq8b1NHNigfBoWBl3Zzcm63", // Nutrition Pro
              },
            },
          },
        }, {
          "$group": {
            "_id": {
              "street": "$destination.address.street",
              "number": "$destination.address.number",
              "city": "$destination.address.city",
              "completeAfter": "$completeAfter",
            },
            "uniqAddress": {
              "$push": "$$ROOT",
            },
          },
        },
      ])
      .toArray();
};
