// import { logger } from "firebase-functions";

import { client } from "../../integrations/mongodb";

export type Task = {
  id: number;
  customerName: string;
  telNumber: string;
  notification: boolean;
  customerNote: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: number;
  country: string;
  deliverAfter: Date;
  deliverBefore: Date;
  client: string;
  quantity: number;
}

const allTasksCollection = client
    .db("on_fleet")
    .collection<Task>("weekly_batch");

export const insertBatch = (tasks: Task[]) => allTasksCollection.insertMany(
    tasks,
    { ordered: true }
);
