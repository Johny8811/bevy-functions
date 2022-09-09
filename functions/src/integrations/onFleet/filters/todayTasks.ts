import { add, getTime, set, sub } from "date-fns";
import { logger } from "firebase-functions";
import { TaskQueryParam } from "@onfleet/node-onfleet/Resources/Tasks";

export const todayTasks = (): Pick<
  TaskQueryParam,
  "from" | "completeAfterAfter" | "completeBeforeBefore"
  > => {
  const today = getTime(set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));
  const from = getTime(sub(today, { days: 7 }));
  const completeBeforeBefore = getTime(add(today, { days: 1 }));

  logger.log("midnightTasksUpdate:todayTasks: ", {
    createdFrom: from,
    completeAfterAfter: today,
    completeBeforeBefore,
  });

  return {
    from,
    completeAfterAfter: today,
    completeBeforeBefore,
  };
};
