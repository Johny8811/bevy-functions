import { logger } from "firebase-functions";
import { format, setMonth, setDate, addMonths, subDays } from "date-fns";

import { withCors } from "../../../middlewares/withCors";
import { withApiAuthorization } from "../../../middlewares/withApiAuthorization";
import { getCouriersDataByMonth } from "../../../database/rohlik";

export const couriersData = withCors(withApiAuthorization(async (req, res) => {
  try {
    const typeParam = String(req.query.type);
    const type = Array.isArray(typeParam) ? typeParam : typeParam?.split(",");

    const month = req.query.month && Number(req.query.month);

    const dateNow = new Date();
    const monthSet = month && setMonth(setDate(dateNow, 1), month - 1);

    const startDate = format(
      monthSet ? monthSet : subDays(dateNow, 1),
      "yyyy-MM-dd"
    );
    const endDate = format(
      monthSet ? addMonths(monthSet, 1) : dateNow,
      "yyyy-MM-dd"
    );

    const filter = {
      _id: {
        $gt: startDate,
        $lt: endDate,
      },
    };

    logger.log("filter ", filter);

    const data = await getCouriersDataByMonth(filter, type);
    res.status(200).json(data);
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("api: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
