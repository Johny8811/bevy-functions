import { logger } from "firebase-functions";
import { getMonth } from "date-fns";

import { withCors } from "../../../middlewares/withCors";
import { withApiAuthorization } from "../../../middlewares/withApiAuthorization";
import { getCouriersDataByMonth } from "../../../database/rohlik";

export const couriersData = withCors(withApiAuthorization(async (req, res) => {
  try {
    const month = req.query.month && Number(req.query.month);
    const typeParam = String(req.query.type);
    const type = Array.isArray(typeParam) ? typeParam : typeParam?.split(",");

    const currentMonth = getMonth(new Date()) + 1;
    const data = await getCouriersDataByMonth(month || currentMonth, type);

    res.status(200).json(data);
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("api: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
