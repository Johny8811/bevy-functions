import * as functions from "firebase-functions";

import { pragReportsInsertData, plzenReportsInsertData } from "../../database/rohlik";
import { BevyRohlikCarriers, getReportsData } from "./getReportsData";

export const getCourierReportsAndSavePrague = functions
    .region("europe-west3")
    .pubsub
    .schedule("00 03 * * *")
    .timeZone("Europe/Prague")
    .onRun(async (context) => {
      functions.logger.log("getCourierReportsAndSavePrague:context ", context.timestamp);

      try {
        const data = await getReportsData(BevyRohlikCarriers.BEVY_PRAGUE, new Date(context.timestamp).getTime());
        await pragReportsInsertData(data);
      } catch (e) {
        functions.logger.log("getCourierReportsAndSavePrague:error:  ", e);
      }
    });

export const getCourierReportsAndSavePlzen = functions
    .region("europe-west3")
    .pubsub
    .schedule("00 03 * * *")
    .timeZone("Europe/Prague")
    .onRun(async (context) => {
      functions.logger.log("getCourierReportsAndSavePlzen:context ", context.timestamp);

      try {
        const data = await getReportsData(BevyRohlikCarriers.BEVY_PLZEN, new Date(context.timestamp).getTime());
        await plzenReportsInsertData(data);
      } catch (e) {
        functions.logger.log("getCourierReportsAndSavePlzen:error:  ", e);
      }
    });
