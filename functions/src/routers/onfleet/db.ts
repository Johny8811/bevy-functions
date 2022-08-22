import { OnfleetTask } from "@onfleet/node-onfleet/Resources/Tasks";

import { client } from "../../integrations/mongodb";
import { getNextDayTimeValues } from "../utils";

const tasksCollection = client
    .db("on_fleet")
    .collection<OnfleetTask>("tasks");

export const insertTasks = (tasks: OnfleetTask[]) => tasksCollection.insertMany(
    tasks,
    { ordered: true }
);

export const getTasksByDate = ({
  from,
  completeAfterAfter,
  completeBeforeBefore,
}: ReturnType<typeof getNextDayTimeValues>) => tasksCollection.find<OnfleetTask>({
  timeCreated: { $gt: from },
  completeAfter: { $gt: completeAfterAfter },
  completeBefore: { $lt: completeBeforeBefore },
}).toArray();
