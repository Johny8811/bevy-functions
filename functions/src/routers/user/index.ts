import { Request, Response } from "express";

import { firebaseAdmin } from "../../integrations/firebase";
import { logger } from "firebase-functions";

export const updateUserInfo = async (req: Request, res: Response) => {
  logger.log("Route:/user/update - route query parameters: ", req.query);

  const userId = req.query?.userId && String(req.query?.userId);
  const displayName = req.query?.displayName && String(req.query?.displayName);
  const photoURL = req.query?.photoURL && String(req.query?.photoURL);

  if (!userId) {
    res.status(400).json({
      error: {
        message: "Missing route query parameters 'userId'",
      },
    });
    return;
  }

  try {
    await firebaseAdmin.auth().updateUser(userId, {
      displayName: displayName || null,
      photoURL: photoURL || null,
    });

    res.status(204).end();
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("Route:/user/update - Error: ", e);
    res.status(500).json({
      error: {
        message: (e as Error).message,
      },
    });
  }
};
