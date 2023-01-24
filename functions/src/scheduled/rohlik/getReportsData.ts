import axios from "axios";
import { getDate, getMonth, getYear, subDays, subMonths, subYears } from "date-fns";

import { csvToJsonStyle } from "../../utils/csvToJsonStyle";
import { RohlikData } from "../../database/types";
import { getEnvVariableOrExit } from "../../utils/getEnvVariableOrExit";

export enum BevyRohlikCarriers {
  BEVY_PRAGUE = "BEVY", // Prague
  BEVY_PLZEN = "BEVYPlz" // Plzen
}

const rohlikUrl = getEnvVariableOrExit("ROHLIK_URL");
const pragueToken = getEnvVariableOrExit("ROHLIK_BEVY_PRAGUE_TOKEN");
const plzenToken = getEnvVariableOrExit("ROHLIK_BEVY_PLZEN_TOKEN");

export const getReportsData = async (carrier: BevyRohlikCarriers, timestamp: number) => {
  // TODO: MISSING TESTS!!! move this to test
  // const testDate = new Date("2023-01-01T00:00:04.983Z"); // result should: "202212"
  // const testDate = new Date("2023-01-02T00:00:04.983Z"); // result should: "202301"
  // const testDate = new Date("2023-01-09T00:00:04.983Z"); // result should: "202301"
  // const testDate = new Date("2023-01-31T00:00:04.983Z"); // result should: "202301"
  // const testDate = new Date("2023-02-01T00:00:04.983Z"); // result should: "202301"
  // const testDate = new Date("2023-02-02T00:00:04.983Z"); // result should: "202302"

  const dateNow = new Date(timestamp); // testDate;

  const currentDay = getDate(dateNow);
  const isFirstDayOfMonth = currentDay === 1;

  const currentMonth = getMonth(dateNow);
  const isFirstMonthOfYear = currentMonth === 0;

  const yearParam = isFirstMonthOfYear && isFirstDayOfMonth
    ? getYear(subYears(dateNow, 1))
    : getYear(dateNow);
  const monthParam = isFirstDayOfMonth ? getMonth(subMonths(dateNow, 1)) : getMonth(dateNow);

  const monthParamStr = ("0" + (monthParam + 1)).slice(-2);
  const getDataDate = `${yearParam}${monthParamStr}`;

  const token = carrier === BevyRohlikCarriers.BEVY_PRAGUE ? pragueToken : plzenToken;

  const invoicingUrl = `${rohlikUrl}/invoicing/?key=${token}&carrier=${carrier}&month=${getDataDate}`;
  const overviewUrl = `${rohlikUrl}/overview/?key=${token}&carrier=${carrier}&month=${getDataDate}`;
  const bonusesPenaltiesUrl
    = `${rohlikUrl}/bonuses-penalties/?key=${token}&carrier=${carrier}&month=${getDataDate}`;

  const [
    invoicingResult,
    overviewResult,
    bonusesPenaltiesResult,
  ] = await Promise.all([
    axios.get(invoicingUrl),
    axios.get(overviewUrl),
    axios.get(bonusesPenaltiesUrl),
  ]);

  const previousDayDateIso = subDays(dateNow, 1).toISOString();

  const invoicing = csvToJsonStyle(invoicingResult.data);
  const overview = csvToJsonStyle(overviewResult.data);
  const bonusesPenalties = csvToJsonStyle(bonusesPenaltiesResult.data);

  const data = {
    _id: previousDayDateIso,
    overview,
    invoicing,
    bonusesPenalties,
  } as unknown as RohlikData;

  return data;
};
