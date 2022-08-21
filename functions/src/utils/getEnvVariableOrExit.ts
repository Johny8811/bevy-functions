import { logger } from "firebase-functions";

export const getEnvVariableOrExit = (variableName: string) => {
  const variable = process.env[variableName];

  if (!variable) {
    logger.error(`Missing environment variable ${variableName}`);
    process.exit(1);
  }

  return variable;
};
