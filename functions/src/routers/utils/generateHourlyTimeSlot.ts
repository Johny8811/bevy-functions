import { getHours, set, isBefore, add, getTime } from "date-fns";

import { OriginOnFleetTask } from "../../types/tasks";

// TODO: add tests
export const generateHourlyTimeSlot = (taskResult: OriginOnFleetTask) => {
  const eat = taskResult.estimatedArrivalTime;

  if (eat) {
    const eatHour = getHours(eat);
    const eatHalfHour = set(eat, {
      hours: eatHour,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    });

    const isInFirstHalfHour = isBefore(eat, eatHalfHour);

    const start = getTime(add(set(eat, {
      hours: eatHour,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }), { minutes: isInFirstHalfHour ? 0 : 30 }));
    const end = getTime(add(start, { hours: 1 }));

    return {
      start,
      end,
    };
  }

  return null;
};
