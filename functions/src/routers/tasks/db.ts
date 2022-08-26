import { OnfleetTask } from "@onfleet/node-onfleet/Resources/Tasks";

import { client } from "../../integrations/mongodb";
import { filterParamsTomorrowTasks } from "../utils";
import { add, getTime, set } from "date-fns";
// import { logger } from "firebase-functions";

const tasksCollection = client
    .db("on_fleet")
    .collection<OnfleetTask>("tasks");

export const insertTasks = (tasks: OnfleetTask[]) => tasksCollection.insertMany(
    tasks,
    { ordered: true }
);

export const getTasksByDate = (date: string) => {
  const today = getTime(set(new Date(date), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));
  const completeAfterAfter = getTime(today);
  const completeBeforeBefore = getTime(add(today, { days: 1 }));

  return tasksCollection.find<OnfleetTask>({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
  }).toArray();
};

export const getTasksByDateAndUserId = (date: string, userId: string) => {
  const today = getTime(set(new Date(date), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));
  const completeAfterAfter = getTime(today);
  const completeBeforeBefore = getTime(add(today, { days: 1 }));

  return tasksCollection.find<OnfleetTask>({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
    metadata: {
      $elemMatch: {
        value: userId,
      },
    },
  }).toArray();
};

export const getTomorrowTasks = () => {
  const filter = filterParamsTomorrowTasks();
  return tasksCollection.find<OnfleetTask>(filter).toArray();
};
