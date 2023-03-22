import { format } from "date-fns";

export const DATE_FORMAT = "yyyy/MM/dd";
export const TIME_FORMAT = "HH:mm";

export const formatToDateAndTime = (timestamp: number | Date) =>
  format(timestamp, `${DATE_FORMAT} ${TIME_FORMAT}`);

export const formatToTime = (timestamp: number | Date) => format(timestamp, TIME_FORMAT);
