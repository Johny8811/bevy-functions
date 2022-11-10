import { logger } from "firebase-functions";

import { firebaseAdmin } from "../../integrations/firebase";
import { withCors } from "../../middlewares/withCors";
import { withAuthorization } from "../../middlewares/withAuthorization";

// TODO: function has to be under role access
export const updateUser = withCors(withAuthorization(async (req, res) => {
  logger.log("Route:/user/update - : ", req.body);

  const bodyParsed = JSON.parse(req.body);
  const userId = bodyParsed.userId;
  const displayName = bodyParsed.displayName;
  const photoURL = bodyParsed.photoURL;
  const email = bodyParsed.email;

  if (!userId) {
    res.status(400).json({ message: "Missing body parameter 'userId'" });
    return;
  }

  const updateUserProps = {};

  if (displayName) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updateUserProps["displayName"] = displayName;
  }

  if (photoURL) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updateUserProps["photoURL"] = photoURL;
  }

  if (email) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updateUserProps["email"] = email;
  }

  try {
    await firebaseAdmin.auth().updateUser(userId, updateUserProps);

    res.status(204).end();
  } catch (e) {
    // TODO: improve error handling and logging
    //  https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
    logger.log("Route:/user/update - Error: ", e);
    res.status(500).json({ message: (e as Error).message });
  }
}));
