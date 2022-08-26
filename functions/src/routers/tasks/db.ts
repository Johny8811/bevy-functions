import { OnfleetTask } from "@onfleet/node-onfleet/Resources/Tasks";

import { client } from "../../integrations/mongodb";
// import { getNextDayTimeValues } from "../utils";
import { add, getTime, set, sub } from "date-fns";
// import { logger } from "firebase-functions";

const tasksCollection = client
    .db("on_fleet")
    .collection<OnfleetTask>("tasks");

export const insertTasks = (tasks: OnfleetTask[]) => tasksCollection.insertMany(
    tasks,
    { ordered: true }
);

export const getTasksByDate = (date: string) => {
  const subtractedDate = sub(new Date(date), { days: 1 });
  const today = getTime(set(subtractedDate, {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));
  const completeAfterAfter = getTime(add(today, { days: 1 }));
  const completeBeforeBefore = getTime(add(today, { days: 2 }));

  return tasksCollection.find<OnfleetTask>({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
  }).toArray();
};

export const getTasksByDateAndUserId = (date: string, userId: string) => {
  const subtractedDate = sub(new Date(date), { days: 1 });
  const today = getTime(set(subtractedDate, {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));
  const completeAfterAfter = getTime(add(today, { days: 1 }));
  const completeBeforeBefore = getTime(add(today, { days: 2 }));

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
  const today = getTime(set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));
  const completeAfterAfter = getTime(add(today, { days: 1 }));
  const completeBeforeBefore = getTime(add(today, { days: 2 }));

  return tasksCollection.find<OnfleetTask>({
    completeAfter: { $gt: completeAfterAfter },
    completeBefore: { $lt: completeBeforeBefore },
  }).toArray();
};
