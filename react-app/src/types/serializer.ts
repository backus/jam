import _ from "lodash";

import { LoginV1, Convert } from ".";

export class Serializer {
  private static optionalKeys = [
    "detail.note",
    "secret.browserState",
    "secret.rawCredentials",
  ];

  static loginV1ToJson(value: LoginV1) {
    this.assertDomainRequiredForBrowserState(value);

    return Convert.loginV1ToJson(
      this.enforceOptionalKeys(value, this.optionalKeys)
    );
  }

  static toLoginV1(json: string) {
    const login = this.removeKeysForUndefinedPaths(
      Convert.toLoginV1(json),
      this.optionalKeys
    );

    this.assertDomainRequiredForBrowserState(login);

    return login;
  }

  private static assertDomainRequiredForBrowserState(value: LoginV1) {
    if (value.secret.browserState && !_.isString(value.info.domain)) {
      throw new Error(
        "Invariant violated! info.domain should be specified for browserState logins"
      );
    }
  }

  private static enforceOptionalKeys<T extends object>(
    object: T,
    paths: string[]
  ): T {
    for (let i = 0; i < paths.length; i++) {
      if (_.has(object, paths[i]) && _.isUndefined(_.get(object, paths[i]))) {
        throw new Error(
          `Found undefined value at ${paths[i]}. Expected omitted key`
        );
      }
    }

    return object;
  }

  private static removeKeysForUndefinedPaths<T extends object>(
    object: T,
    paths: string[]
  ): T {
    const undefinedPaths = _.filter(
      paths,
      (path) => _.has(object, path) && _.isUndefined(_.get(object, path))
    );

    return _.omit(object, undefinedPaths) as T;
  }
}
