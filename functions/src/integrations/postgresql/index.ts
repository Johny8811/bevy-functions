import { Client } from "pg";
import { logger } from "firebase-functions";

const credentials = {
  user: "retool",
  host: "db-pgsql-fra1-15262-dev-do-user-12893652-0.b.db.ondigitalocean.com",
  database: "bevy",
  password: "AVNS_yoCJtMYFCZmsYTOxXnN",
  port: 25060,
  ssl: { rejectUnauthorized: false },
};

export const client = new Client(credentials);
client.connect((err) => {
  if (err) {
    logger.error("PostgeSQL:connectionError ", err);
  }
});
// await client.end();

