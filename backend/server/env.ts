import * as dotenv from "dotenv";
import * as _ from "lodash";
import * as R from "ramda";
// Same parser bull uses
import { parseExpression as parseCronExpression } from "cron-parser";
import * as path from "path";
import bugsnag from "@bugsnag/js";
import { AppError, AppReqError } from "./error";

dotenv.config();

const requireVar = (key: string): string => {
  if (!(key in process.env))
    throw new Error(`Expected process.env.${key} to be defined!`);
  const value = process.env[key];
  if (!_.isString(value))
    throw new Error(`Expected process.env.${key} to be a string!`);
  if (R.trim(value) === "")
    throw new Error(`Expected process.env.${key} to not be blank!`);

  return value;
};

const constrainEnv = (
  value: string
): value is "development" | "test" | "production" => {
  const env = process.env.NODE_ENV || "development";
  if (env !== "development" && env !== "test" && env !== "production")
    throw new Error("Invalid NODE_ENV");

  return true;
};

const requireBoolVar = (key: string): boolean => {
  const value = requireVar(key);

  if (value !== "true" && value !== "false")
    throw new Error(`Invalid boolean value for process.env.${key}!`);

  return value === "true";
};

const requireIntVar = (key: string): number => {
  const value = requireVar(key);

  if (!/^\d+$/.test(value))
    throw new Error(`Invalid integer value for process.env.${key}!`);

  return _.toInteger(value);
};

const validateVar = <T>(
  value: T,
  validator: (value: T) => boolean,
  errorMessage: string
): T => {
  if (validator(value)) return value;

  throw new Error(`Invalid value for environment variable: ${errorMessage}`);
};

const nodeEnv = requireVar("NODE_ENV");
if (!constrainEnv(nodeEnv)) throw new Error("Invalid env");

const env = {
  NODE_ENV: nodeEnv,
  AWS_REGION: requireVar("AWS_REGION"),
  redisUrl: requireVar("REDIS_URL"),
  AWS_ACCESS_KEY: requireVar("AWS_ACCESS_KEY"),
  AWS_SECRET_KEY: requireVar("AWS_SECRET_KEY"),
  S3_AVATARS_BUCKET: requireVar("S3_AVATARS_BUCKET"),
  mailgunApiKey: requireVar("MAILGUN_API_KEY"),
  mailgunDomain: requireVar("MAILGUN_DOMAIN"),
  domain: new URL(requireVar("APP_DOMAIN")),
  INVITE_ONLY: requireBoolVar("REACT_APP_INVITE_ONLY"),
  bugsnagKey: requireVar("BUGSNAG_KEY"),
  adminPath: requireVar("ADMIN_PATH"), // Should be a random hex string
  adminUsername: requireVar("ADMIN_USERNAME"),
  adminPassword: requireVar("ADMIN_PASSWORD"),
  betaInvites: {
    batchSize: validateVar(
      requireIntVar("BETA_INVITES_BATCH_SIZE"),
      (num) => num <= 100,
      "BETA_INVITES_BATCH_SIZE should be less than or equal to 100"
    ),
    // NOTE: The hour specified in the cron is in UTC! It should be offset for the time zone
    // we expect the user to be in
    cronSchedule: validateVar(
      requireVar("BETA_INVITES_EMAIL_CRON"),
      (schedule: string) => {
        try {
          parseCronExpression(schedule);
          return true;
        } catch (error) {
          console.error(
            "Invalid cron expression! Error:",
            error,
            "Expression:",
            schedule
          );
          return false;
        }
      },
      "BETA_INVITES_EMAIL_CRON is invalid"
    ),
  },
  slackPulseWebhookUrl: requireVar("SLACK_PULSE_WEBHOOK_URL"),
  isStaging: requireBoolVar("REACT_APP_STAGING"),
  appMode: validateVar(
    requireVar("APP_MODE"),
    (mode) => mode === "web" || mode == "worker",
    "APP_MODE should be web or worker"
  ),
  chromeExtensionId: requireVar("REACT_APP_CHROME_EXTENSION_ID"),
  cookieSecret: validateVar(
    requireVar("COOKIE_SECRET"),
    (value) => /^[\da-f]{64}$/.test(value),
    "COOKIE_SECRET must be 64 character hex string"
  ),
};

const instances = {
  bugsnag: bugsnag({
    apiKey: env.bugsnagKey,
    notifyReleaseStages: ["staging", "production"],
    releaseStage: env.isStaging ? "staging" : env.NODE_ENV,
    beforeSend: (report) => {
      if (report.originalError instanceof AppError) {
        report.ignore();
      }
    },
  }),
};

// In development we are being run by ts-node, so it's just the dir structure
const devProjectRoot = path.resolve(__dirname, "..");
// In prod, the project is compiled and this file is inside of /app/build/server
const prodProjectRoot = path.resolve(devProjectRoot, "..");

const helpers = {
  isProd: () => env.NODE_ENV === "production",
  isDevelopment: () => env.NODE_ENV === "development",
  appUrl: (uri: string) => new URL(uri, env.domain).toString(),
  projectRoot: () =>
    env.NODE_ENV === "development" ? devProjectRoot : prodProjectRoot,
  chromeExtensionUrl: () =>
    `https://chrome.google.com/webstore/detail/${env.chromeExtensionId}`,
};

export default { ...env, ...helpers, ...instances };
