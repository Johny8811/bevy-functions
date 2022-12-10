// import { logger } from "firebase-functions";

import { client } from "../../integrations/mongodb";

type User = {
  _id: string;
  carrier_id: number;
  name: string;
  firebase_id: string;
  email: string;
  api_key: string;
}

const usersCollection = client
    .db("users")
    .collection<User>("all_users");

export const findUserByApiKey = (apiKey: string) => usersCollection
    .findOne({
      api_key: { $eq: apiKey },
    });

