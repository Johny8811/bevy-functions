import { logger } from "firebase-functions";
import { MongoClient, ServerApiVersion } from "mongodb";

import { getEnvVariableOrExit } from "../../utils/getEnvVariableOrExit";

const mongoUri = getEnvVariableOrExit("MONGO_URI");

export const client = new MongoClient(mongoUri, {
  // FIXME: ts doesn't know some props of mongo client
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

client.connect((err) => {
  if (err) {
    logger.error("MongoDB:connectionError ", err);
  }
});
