import { getAllTasks } from "../../integrations/onFleet/getAllTasks";
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

  logger.log("getTasksForNextDay - Get tasks times: ", {
    createdFrom,
    completeAfterAfter,
    completeBeforeBefore,
  });

  return getAllTasks({
    from: createdFrom,
    completeAfterAfter,
    completeBeforeBefore,
  });
};
