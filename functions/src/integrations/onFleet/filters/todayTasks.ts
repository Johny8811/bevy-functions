import { add, getTime, set, sub } from "date-fns";
import { logger } from "firebase-functions";
import { TaskQueryParam } from "@onfleet/node-onfleet/Resources/Tasks";

/**
 * Return query parameters to get tasks for today
 *
 * @param {number} initTimestamp - use, when is needed to ensure call method with specific time
 *
 * @typedef {Object} Params
 * @property {number} from - Tasks created from
 * @property {number} completeAfterAfter - Tasks that should be complete after this time
 * @property {number} completeBeforeBefore - Tasks that should be complete before this time
 *
 * @return {Params}
 */
export const todayTasks = (initTimestamp?: number): Pick<
  TaskQueryParam,
  "from" | "completeAfterAfter" | "completeBeforeBefore"
  > => {
  const today = getTime(set(initTimestamp || new Date(), {
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
