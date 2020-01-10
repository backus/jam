import env from "./clientEnv";
import * as _ from "lodash";

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
