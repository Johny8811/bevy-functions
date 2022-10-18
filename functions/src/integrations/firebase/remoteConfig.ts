import { logger } from "firebase-functions";

import { firebaseAdmin } from "./index";
import { RemoteConfigParameters, ROLES } from "./types";

// TODO: use "userClaims" for roles system
export const getValueByParameterName = async (name: RemoteConfigParameters) => {
  try {
    const config = firebaseAdmin.remoteConfig();
    const template = await config.getTemplate();

    const parameter = template.parameters[name];

    if (!parameter) {
      logger.error(`Parameter name: "${name}" was not found in Remote Config template.`);
      return;
    }

    return (parameter.defaultValue as { value: string }).value;
  } catch (err) {
    logger.error("Remote config: Unable to get template");
    logger.error(err);

    return;
  }
};

export const hasRole = (roles: ROLES[], role: ROLES) => {
  if (roles) {
    if (role === "user" && roles.length === 0) {
      return true;
    }

    return roles.includes(role);
  }

  return false;
};
