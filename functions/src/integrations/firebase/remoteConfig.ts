import { logger } from "firebase-functions";

import { firebaseAdmin } from "./index";

export enum RemoteConfigParameters {
  USERS_ROLES = "usersRoles"
}

export const getValueByParameterName = async (name: RemoteConfigParameters) => {
  try {
    const config = firebaseAdmin.remoteConfig();
    const template = await config.getTemplate();

    const parameter = template.parameters[name];

    if (!parameter) {
      logger.error(`Parameter name: "${name}" was not found in Remote Config template.`);
      return;
    }

    return {
      value: (parameter.defaultValue as { value: string }).value,
    };
  } catch (err) {
    logger.error("Remote config: Unable to get template");
    logger.error(err);

    return;
  }
};
