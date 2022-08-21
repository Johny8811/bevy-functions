import { logger } from "firebase-functions";
import OnFleet from "@onfleet/node-onfleet";

import { getEnvVariableOrExit } from "../../utils/getEnvVariableOrExit";

const onFleetApiKey = getEnvVariableOrExit("ON_FLEET_API_KEY");

export const onFleetApi = new OnFleet(onFleetApiKey);

onFleetApi
    .verifyKey()
    .then((isValid) => {
      logger.log("OnFleet api key validity: ", isValid);
    })
    .catch((e) => {
      logger.log("Error while verify onFleet api key: ", e);
    });
