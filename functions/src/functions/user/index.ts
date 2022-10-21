import { logger } from "firebase-functions";

import { firebaseAdmin } from "../../integrations/firebase";
import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";

// TODO: function has to be under role access
export const updateUser = withCors(withAuthorization(async (req, res) => {
  logger.log("Route:/user/update - : ", req.body);

  const bodyParsed = JSON.parse(req.body);
  const userId = req.user.uid;
  const displayName = bodyParsed.displayName;
  const photoURL = bodyParsed.photoURL;

  if (!userId) {
    res.status(400).json({ message: "Missing body parameter 'userId'" });
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
    res.status(500).json({ message: (e as Error).message });
  }
}));
