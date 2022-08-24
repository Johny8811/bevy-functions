import { Request, Response, NextFunction } from "express";
import { logger } from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();

// source: https://github.com/firebase/functions-samples/tree/main/authorized-https-endpoint
export const authorizeUser = async (req: Request, res: Response, next: NextFunction) => {
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
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    logger.log("authorizeUser: ID Token correctly decoded", decodedIdToken);
    // FIXME: type correctly, see "src/types/custom.d.ts" - "decodedIdToken" come from firebase-admin
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    logger.error("authorizeUser: Error while verifying Firebase ID token:", error);
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
};
