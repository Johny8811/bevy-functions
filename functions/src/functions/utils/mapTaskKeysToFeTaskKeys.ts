import { OurOnFleetTask } from "../../types/tasks";

export const mapTaskKeysToFeTaskKeys = (tasks: OurOnFleetTask[]) => tasks.map(({
  id,
  shortId,
  recipients,
  destination,
  estimatedCompletionTime,
  order,
  completeAfter,
  completeBefore,
  quantity,
  slot,
  completionDetails,
  worker,
}) => ({
  id,
  shortId,
  recipients,
  destination,
  estimatedCompletionTime,
  order,
  completeAfter,
  completeBefore,
  quantity,
  slot,
  completionDetails,
  worker,
}));
