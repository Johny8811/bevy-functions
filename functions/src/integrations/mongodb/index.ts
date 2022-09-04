import { logger } from "firebase-functions";
import { MongoClient, ServerApiVersion } from "mongodb";

import { getEnvVariableOrExit } from "../../utils/getEnvVariableOrExit";

// TODO: implement dev flag to change mongo URI
const mongoUri = getEnvVariableOrExit("MONGO_URI_PROD");

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
    logger.log("MongoDB:connectionError ", err);
  }
});
