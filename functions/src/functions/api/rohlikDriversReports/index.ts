import { logger } from "firebase-functions";

import { withCors } from "../../../middlewares/withCors";
import { withApiAuthorization } from "../../../middlewares/withApiAuthorization";
import { CourierReport } from "../../../database/types";
import { couriersReportsInsertData } from "../../../database/rohlik";

export const couriersReports = withCors(withApiAuthorization(async (req, res) => {
  try {
    const reports: CourierReport[] = JSON.parse(req.body);

    await couriersReportsInsertData({
      created: new Date().getTime(),
      data: reports,
    });

    res.status(200).send();
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("api: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
