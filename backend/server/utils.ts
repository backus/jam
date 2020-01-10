import * as _ from "lodash";
import env from "./env";

export const toInt = (value: string): number => {
  const int = parseInt(value);
  if (_.isNaN(int)) throw new Error("Invalid parse!");

  return int;
};

export const sleep = async (ms: number) => {
  if (env.isProd()) {
    env.bugsnag.notify("Calling sleep() in prod??");
  }

  return new Promise((resolve) => setTimeout(() => resolve(), ms));
};

export const isUuid = (value: string) =>
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/.test(value);
