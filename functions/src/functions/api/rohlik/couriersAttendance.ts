import { logger } from "firebase-functions";

import { withCors } from "../../../middlewares/withCors";
import { withApiAuthorization } from "../../../middlewares/withApiAuthorization";
import { CourierAttendance } from "../../../database/types";
import { couriersAttendanceInsertData } from "../../../database/rohlik";

export const couriersAttendance = withCors(withApiAuthorization(async (req, res) => {
  try {
    const reports: CourierAttendance[] = JSON.parse(req.body);

    await couriersAttendanceInsertData({
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
