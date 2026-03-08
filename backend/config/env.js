import "dotenv/config";

export const DEFAULT_MONGO_URI = "mongodb://mongo:27017/pomomate";
export const DEFAULT_JWT_SECRET_KEY = "replace-me";

const readEnvValue = (name) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
};

export const hasCustomEnvValue = (name) => readEnvValue(name).length > 0;

export const MONGO_URI = readEnvValue("MONGO_URI") || DEFAULT_MONGO_URI;
export const JWT_SECRET_KEY =
  readEnvValue("JWT_SECRET_KEY") || DEFAULT_JWT_SECRET_KEY;
