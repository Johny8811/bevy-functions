import { logger } from "firebase-functions";
import { getTime, getHours, set, add, isBefore, isAfter } from "date-fns";

import { OriginOnFleetTask } from "../../types/tasks";
import { formatToDateAndTime } from "../../utils/formatDates";

// TODO: add tests
export const generateHourlyTimeSlot = (task: OriginOnFleetTask) => {
  const eat = task.estimatedCompletionTime;
  const completeAfter = task.completeAfter;
  const completeBefore = task.completeBefore;

  logger.log("generateHourlyTimeSlot: task values ", {
    eat: eat && formatToDateAndTime(eat),
    completeAfter: formatToDateAndTime(completeAfter),
    completeBefore: formatToDateAndTime(completeBefore),
  }, {
    eat,
    completeAfter,
    completeBefore,
  });

  if (eat) {
    const eatHour = getHours(eat);
    logger.log("generateHourlyTimeSlot: eatHour ", eatHour);

    const eatHalfHour = set(eat, {
      hours: eatHour,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    });
    logger.log("generateHourlyTimeSlot: eatHalfHour ", eatHalfHour);

    const isInFirstHalfHour = isBefore(eat, eatHalfHour);
    logger.log("generateHourlyTimeSlot: isInFirstHalfHour ", isInFirstHalfHour);

    const startTime = getTime(
        add(
            set(eat, {
              hours: eatHour,
              minutes: 0,
              seconds: 0,
              milliseconds: 0,
            }),
            { minutes: isInFirstHalfHour ? 0 : 30 }
        )
    );
    logger.log("generateHourlyTimeSlot: startTime ", formatToDateAndTime(startTime));

    const endTime = getTime(add(startTime, { hours: 1 }));
    logger.log("generateHourlyTimeSlot: endTime ", formatToDateAndTime(endTime));

    const start = isBefore(startTime, completeAfter) ? completeAfter : startTime;
    const end = isAfter(endTime, completeBefore) ? completeBefore : endTime;

    logger.log("generateHourlyTimeSlot: slot ", {
      start: formatToDateAndTime(start),
      end: formatToDateAndTime(end),
    });

    return {
      start,
      end,
    };
  }

  return null;
};
