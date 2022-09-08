import { Request, Response } from "express";

import { firebaseAdmin } from "../../integrations/firebase";
import { logger } from "firebase-functions";

// TODO: correctly type Request, Response
export const updateUserInfo = async (req: Request, res: Response) => {
  logger.log("Route:/user/update - : ", req.body);

  const bodyParsed = JSON.parse(req.body);
  const userId = bodyParsed.userId;
  const displayName = bodyParsed.displayName;
  const photoURL = bodyParsed.photoURL;

  if (!userId) {
    res.status(400).json({
      error: {
        message: "Missing body parameter 'userId'",
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
