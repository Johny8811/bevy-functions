import { logger } from "firebase-functions";
import { OnfleetMetadata } from "@onfleet/node-onfleet/metadata";

import { TaskMetadata } from "../../types/tasks";

export const getMetadataValueByName = (metadata: OnfleetMetadata[], name: TaskMetadata) => {
  logger.log("getMetadataValueByName:metadata ", metadata, " metadata:name ", name);
  return metadata.find((m) => m.name === name)?.value;
};
