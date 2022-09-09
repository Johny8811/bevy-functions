import { add, sub, getTime, set } from "date-fns";
import { TaskQueryParam } from "@onfleet/node-onfleet/Resources/Tasks";
import { logger } from "firebase-functions";

export const tomorrowTasks = (): Pick<
  TaskQueryParam,
  "from" | "completeAfterAfter" | "completeBeforeBefore"
  > => {
  const today = set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const from = getTime(sub(today, { days: 7 }));
  const completeAfterAfter = getTime(add(today, { days: 1 }));
  const completeBeforeBefore = getTime(add(today, { days: 2 }));

  logger.log("filterTomorrowTasks: ", {
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
