import { client } from "../integrations/mongodb";
import { RohlikData, Report } from "./types";

const tasksCollection = client
    .db("rohlik")
    .collection<RohlikData>("couriers");


export const insertData = (data: RohlikData) => tasksCollection.insertOne(data);

const couriersReportsCollection = client
    .db("rohlik")
    .collection<Report>("couriersReports");

export const couriersReportsInsertData = (data: Report) => couriersReportsCollection.insertOne(data);
