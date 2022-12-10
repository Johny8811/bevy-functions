import { logger, Request, Response } from "firebase-functions";

import { findUserByApiKey } from "../functions/api/users_db";
import { SKIP_API_AUTH } from "../constants";

export type FunctionHandler = (
  req: Request,
  res: Response,
) => void | Promise<void>;

// source: https://github.com/firebase/functions-samples/tree/main/authorized-https-endpoint
export const withApiAuthorization = (handler: FunctionHandler) => async (req: Request, res: Response) => {
  if (SKIP_API_AUTH) {
    handler(req, res);
    return;
  }

  logger.log("authorizeAPI: Check if request is authorized with Bearer token");

  if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
    logger.error(
        `authorizeAPI: No API key was passed as a Bearer token in the Authorization header.
        Make sure you authorize your request by providing the following HTTP header:
        Authorization: Bearer {API_KEY}.`
    );

    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  let apiKey;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    logger.log("authorizeAPI: Found 'Authorization' header");

    apiKey = req.headers.authorization.split("Bearer ")[1];
  } else {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const user = await findUserByApiKey(apiKey);

    logger.log("authorizeAPI: user", { user });

    if (!user) {
      throw new Error("User not found!");
    }

    req.apiUser = user;
    handler(req, res);
    return;
  } catch (error) {
    logger.error("authorizeUser: Error while verifying API key:", error);

    res.status(403).json({ message: "Unauthorized" });
    return;
  }
};
