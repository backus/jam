import * as _ from "lodash";
import * as R from "ramda";
import bugsnag from "@bugsnag/js";

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

const requireBoolVar = (key: string): boolean => {
  const value = requireVar(key);

  if (value !== "true" && value !== "false")
    throw new Error(`Invalid boolean value for process.env.${key}!`);

  return value === "true";
};

const env = {
  INVITE_ONLY: requireBoolVar("REACT_APP_INVITE_ONLY"),
  magicLinksEnabled: requireBoolVar("REACT_APP_MAGIC_LINKS_ENABLED"),
  isStaging: requireBoolVar("REACT_APP_STAGING"),
  bugsnagKey: requireVar("REACT_APP_BUGSNAG_KEY"),
  backendHost: new URL(requireVar("REACT_APP_BACKEND_HOST")),
  nodeEnv: requireVar("NODE_ENV"),
  chromeExtensionId: requireVar("REACT_APP_CHROME_EXTENSION_ID"),
  webEnv: requireVar("REACT_APP_ENVIRONMENT"),
};

const instances = {
  bugsnag: bugsnag({
    apiKey: env.bugsnagKey,
    notifyReleaseStages: ["staging", "production"],
    releaseStage: env.isStaging ? "staging" : env.nodeEnv,
    appType: env.webEnv,
  }),
};

const helpers = {
  isProd: () => env.nodeEnv === "production",
  isDevelopment: () => env.nodeEnv === "development",
  absolutePath: (uri: string) =>
    uri.match(/^https?:\/\//) ? uri : new URL(uri, env.backendHost).toString(),
  chromeExtensionUrl: () =>
    `https://chrome.google.com/webstore/detail/${env.chromeExtensionId}`,
};

export default { ...env, ...instances, ...helpers };
