import { sub, getTime, set } from "date-fns";
import { TaskQueryParam } from "@onfleet/node-onfleet/Resources/Tasks";
import { logger } from "firebase-functions";

/**
 * Return query parameters to get tasks for yesterday
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
export const yesterdayTasks = (initTimestamp?: number): Pick<
  TaskQueryParam,
  "from" | "completeAfterAfter" | "completeBeforeBefore"
  > => {
  const today = set(initTimestamp || new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const from = getTime(sub(today, { days: 7 }));
  const completeAfterAfter = getTime(sub(today, { days: 1 }));
  const completeBeforeBefore = getTime(today);

  logger.log("filterYesterdayTasks: ", {
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
