import { identity, pickBy } from "lodash";
import { Filter } from "mongodb";

import { client } from "../integrations/mongodb";
import { RohlikData, Report } from "./types";

const db = client.db("rohlik");

// ------- couriers reports Prague - overview, invoicing, bonuses / penalties
const couriersDataCollection = db.collection<RohlikData>("couriers");

export const pragReportsInsertData = (data: RohlikData) => couriersDataCollection.insertOne(data);

const dateTypeEnum = ["overview", "invoicing", "bonusesPenalties"];

export const getCouriersDataByMonth = (filter: Filter<RohlikData>, type: string | string[]) => {
  const projection = pickBy(dateTypeEnum.reduce(
      (t, v) =>
        ({
          ...t,
          [v]: type?.includes(v),
        }),
      {}
  ), identity);

  // TODO: missing "year" resolve, will break in new year
  return couriersDataCollection.find(filter, {
    projection,
  }).toArray();
};

// ------- couriers reports Prague - overview, invoicing, bonuses / penalties
const courierDataPlzenCollection = db.collection<RohlikData>("couriersPlzen");

export const plzenReportsInsertData = (data: RohlikData) => courierDataPlzenCollection.insertOne(data);

export const getCourierDataPlzenByMonth = (filter: Filter<RohlikData>, type: string | string[]) => {
  const projection = pickBy(dateTypeEnum.reduce(
      (t, v) =>
        ({
          ...t,
          [v]: type?.includes(v),
        }),
      {}
  ), identity);

  // TODO: missing "year" resolve, will break in new year
  return courierDataPlzenCollection.find(filter, {
    projection,
  }).toArray();
};

// ------- couriers reports from rohlik about attendance
const couriersReportsCollection = db.collection<Report>("couriersReports");

export const couriersReportsInsertData = (data: Report) => couriersReportsCollection.insertOne(data);
