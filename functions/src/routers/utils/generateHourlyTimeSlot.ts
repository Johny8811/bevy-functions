import { getHours, set, isBefore, add, getTime } from "date-fns";

import { OriginOnFleetTask } from "../../types/tasks";

export const generateHourlyTimeSlot = (taskResult: OriginOnFleetTask) => {
  const ect = taskResult.estimatedCompletionTime;

  if (ect) {
    const ectHour = getHours(ect);
    const ectHalfHour = set(ect, {
      hours: ectHour,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    });

    const isInFirstHalfHour = isBefore(ect, ectHalfHour);

    const start = getTime(add(set(ect, {
      hours: ectHour,
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
