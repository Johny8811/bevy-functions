import { OnfleetTask } from "@onfleet/node-onfleet/Resources/Tasks";

import { client } from "../../integrations/mongodb";

const tasksCollection = client
    .db("on_fleet")
    .collection<OnfleetTask>("tasks");

export const insertTasks = (tasks: OnfleetTask[]) => tasksCollection.insertMany(
    tasks,
    { ordered: true }
);
