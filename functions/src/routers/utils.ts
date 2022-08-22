import { add, getTime, set } from "date-fns";
import { TaskQueryParam } from "@onfleet/node-onfleet/Resources/Tasks";
import { logger } from "firebase-functions";

export const getNextDayTimeValues = (): Pick<
  TaskQueryParam,
  "from" | "completeAfterAfter" | "completeBeforeBefore"
> => {
  const today = new Date();

  const from = getTime(set(today, {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));
  const completeAfterAfter = getTime(add(from, { days: 1 }));
  const completeBeforeBefore = getTime(add(from, { days: 2 }));

  logger.log("getTasksForNextDay - Get tasks times: ", {
    createdFrom: from,
    completeAfterAfter,
    completeBeforeBefore,
  });

  return {
    from,
    completeAfterAfter,
    completeBeforeBefore,
  };
};
