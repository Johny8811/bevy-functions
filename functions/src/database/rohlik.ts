import { identity, pickBy } from "lodash";

import { client } from "../integrations/mongodb";
import { RohlikData, Report } from "./types";

const db = client.db("rohlik");

// couriers data - overview, invoicing, bonuses / penalties
const couriersDataCollection = db.collection<RohlikData>("couriers");

export const insertData = (data: RohlikData) => couriersDataCollection.insertOne(data);

const dateTypeEnum = ["overview", "invoicing", "bonusesPenalties"];

export const getCouriersDataByMonth = (month: number, type: string | string[]) => {
  const startMonth = month;
  const endMonth = startMonth === 12 ? 1 : startMonth + 1;

  const startMonthString = ("0" + startMonth).slice(-2);
  const endMonthString = ("0" + endMonth).slice(-2);

  const projection = pickBy(dateTypeEnum.reduce(
      (t, v) =>
        ({
          ...t,
          [v]: type?.includes(v),
        }),
      {}
  ), identity);

  // TODO: missing "year" resolve, will break in new year
  return couriersDataCollection.find({
    _id: {
      $gt: `2023-${startMonthString}`,
      $lt: `2023-${endMonthString}`,
    },
  }, { projection }).toArray();
};

// couriers reports from rohlik about attendance
const couriersReportsCollection = db.collection<Report>("couriersReports");

export const couriersReportsInsertData = (data: Report) => couriersReportsCollection.insertOne(data);
