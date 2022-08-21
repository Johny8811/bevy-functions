import { onFleetApi } from "../../integrations/onFleet";
import { getTime, set, add } from "date-fns";
import { logger } from "firebase-functions";

export const getTasksForNextDay = () => {
  const createdFrom = getTime(set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));
  const completeAfterAfter = getTime(add(createdFrom, { days: 1 }));
  const completeBeforeBefore = getTime(add(createdFrom, { days: 2 }));

  logger.log("Get tasks times: ", {
    createdFrom,
    completeAfterAfter,
    completeBeforeBefore,
  });

  return onFleetApi.tasks.get({
    from: createdFrom,
    completeAfterAfter,
    completeBeforeBefore,
  });
};
