import * as functions from "firebase-functions";
import axios from "axios";
import { getYear, getMonth, getDate, subDays, subMonths, subYears } from "date-fns";

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

      // TODO: MISSING TESTS!!! move this to test
      // const testDate = new Date("2023-01-01T00:00:04.983Z"); // result should: "202212"
      // const testDate = new Date("2023-01-02T00:00:04.983Z"); // result should: "202301"
      // const testDate = new Date("2023-01-09T00:00:04.983Z"); // result should: "202301"
      // const testDate = new Date("2023-01-31T00:00:04.983Z"); // result should: "202301"
      // const testDate = new Date("2023-02-01T00:00:04.983Z"); // result should: "202301"
      // const testDate = new Date("2023-02-02T00:00:04.983Z"); // result should: "202302"

      const dateNow = new Date(); // testDate;

      const currentDay = getDate(dateNow);
      const isFirstDayOfMonth = currentDay === 1;

      const currentMonth = getMonth(dateNow);
      const isFirstMonthOfYear = currentMonth === 0;

      const yearParam = isFirstMonthOfYear && isFirstDayOfMonth ?
        getYear(subYears(dateNow, 1)) :
        getYear(dateNow);
      const monthParam = isFirstDayOfMonth ? getMonth(subMonths(dateNow, 1)) : getMonth(dateNow);

      const monthParamStr = ("0" + (monthParam + 1)).slice(-2);
      const getDataDate = `${yearParam}${monthParamStr}`;

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
