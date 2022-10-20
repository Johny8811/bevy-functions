import { Request, Response, NextFunction } from "express";
import { logger } from "firebase-functions";

import { firebaseAdmin } from "../integrations/firebase";
import { SKIP_AUTH } from "../constants";


/**
 * // @deprecated - remove with other old code
 */
// source: https://github.com/firebase/functions-samples/tree/main/authorized-https-endpoint
export const authorizeUser = async (req: Request, res: Response, next: NextFunction) => {
  if (SKIP_AUTH) {
    next();
    return;
  }

  logger.log("authorizeUser: Check if request is authorized with Firebase ID token");

  if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
    logger.error(
        `authorizeUser: No Firebase ID token was passed as a Bearer token in the Authorization header.
        Make sure you authorize your request by providing the following HTTP header:
        Authorization: Bearer <Firebase ID Token>.`
    );

    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    logger.log("authorizeUser: Found 'Authorization' header");

    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decodedIdToken = await firebaseAdmin.auth().verifyIdToken(idToken);

    logger.log("authorizeUser: ID Token correctly decoded", decodedIdToken);

    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    logger.error("authorizeUser: Error while verifying Firebase ID token:", error);

    res.status(403).json({ message: "Unauthorized" });
    return;
  }
};
