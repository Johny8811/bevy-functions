import { getTime, getHours, set, add, isBefore, isAfter } from "date-fns";

import { OriginOnFleetTask } from "../../types/tasks";

// TODO: add tests
export const generateHourlyTimeSlot = (task: OriginOnFleetTask) => {
  const eat = task.estimatedArrivalTime;
  const completeAfter = task.completeAfter;
  const completeBefore = task.completeBefore;

  if (eat) {
    const eatHour = getHours(eat);
    const eatHalfHour = set(eat, {
      hours: eatHour,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    });

    const isInFirstHalfHour = isBefore(eat, eatHalfHour);

    const startTime = getTime(add(set(eat, {
      hours: eatHour,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }), { minutes: isInFirstHalfHour ? 0 : 30 }));
    const endTime = getTime(add(startTime, { hours: 1 }));

    const start = isBefore(startTime, completeAfter) ? completeAfter : startTime;
    const end = isAfter(endTime, completeBefore) ? completeBefore : endTime;

    return {
      start,
      end,
    };
  }

  return null;
};
