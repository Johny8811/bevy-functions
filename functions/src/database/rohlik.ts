import { client } from "../integrations/mongodb";
import { RohlikData } from "./types";

const tasksCollection = client
    .db("rohlik")
    .collection<RohlikData>("couriers");


export const insertData = (data: RohlikData) => tasksCollection.insertOne(data);

