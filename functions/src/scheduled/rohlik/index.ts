import * as functions from "firebase-functions";
import axios from "axios";
import { getYear, getMonth, subDays } from "date-fns";

import { getEnvVariableOrExit } from "../../utils/getEnvVariableOrExit";
import { csvToJsonStyle } from "../../utils/csvToJsonStyle";
import { insertData } from "../../database/rohlik";
import { RohlikData } from "../../database/types";

const rohlikUrl = getEnvVariableOrExit("ROHLIK_URL");
const rohlikToken = getEnvVariableOrExit("ROHLIK_TOKEN");

export const getCouriersDataAndSaveToDb = functions
    .region("europe-west3")
    .pubsub
    .schedule("59 23 * * *")
    .timeZone("Europe/Prague")
    .onRun(async (context) => {
      functions.logger.log("getCouriersDataAndSaveToDb:context ", context);

      const currentYear = getYear(new Date());
      const currentMonth = getMonth(new Date());
      const currentMonthString = ("0" + (currentMonth + 1)).slice(-2);
      const getDataDate = `${currentYear}${currentMonthString}`;

      try {
        const invoicingUrl = `${rohlikUrl}/invoicing/?key=${rohlikToken}&carrier=BEVY&month=${getDataDate}`;
        const overviewUrl = `${rohlikUrl}/overview/?key=${rohlikToken}&carrier=BEVY&month=${getDataDate}`;
        const bonusesPenaltiesUrl =
          `${rohlikUrl}/bonuses-penalties/?key=${rohlikToken}&carrier=BEVY&month=${getDataDate}`;

        const [
          invoicingResult,
          overviewResult,
          bonusesPenaltiesResult,
        ] = await Promise.all([
          axios.get(invoicingUrl),
          axios.get(overviewUrl),
          axios.get(bonusesPenaltiesUrl),
        ]);

        const previousDayDateIso = subDays(new Date(), 1).toISOString();

        const invoicing = csvToJsonStyle(invoicingResult.data);
        const overview = csvToJsonStyle(overviewResult.data);
        const bonusesPenalties = csvToJsonStyle(bonusesPenaltiesResult.data);

        const data = {
          _id: previousDayDateIso,
          overview,
          invoicing,
          bonusesPenalties,
        } as unknown as RohlikData;

        await insertData(data);
      } catch (e) {
        functions.logger.log("getCouriersDataAndSaveToDb:Error:  ", e);
      }
    });
