import env from "./env";
import * as _ from "lodash";

export const clearBugsnagSession = () => {
  try {
    env.bugsnag.user = {};
    env.bugsnag.metaData = {};
  } catch (error) {
    env.bugsnag.notify(`Clearing bugsnag metadata failed? ${error}`);
  }
};

export const addToBugsnagUser = (userInfo: object) => {
  try {
    env.bugsnag.user = _.defaultsDeep(
      _.cloneDeep(userInfo),
      _.cloneDeep(env.bugsnag.user)
    );
  } catch (error) {
    env.bugsnag.notify(`Setting bugsnag user failed? ${error}`);
  }
};

export const addToBugsnagMetadata = (metadata: object) => {
  try {
    env.bugsnag.metaData = _.defaultsDeep(
      _.cloneDeep(metadata),
      _.cloneDeep(env.bugsnag.metaData)
    );
  } catch (error) {
    env.bugsnag.notify(`Setting bugsnag metadata failed? ${error}`);
  }
};
