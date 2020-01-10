import _ from "lodash";
import {
  LoginCredentialsV0,
  LoginV1,
  LoginPreviewV0,
  LoginPreviewV1,
} from "./types";

export class LoginMapper {
  public static credentialsToV1(v0: LoginCredentialsV0): LoginV1 {
    return {
      info: _.pick(v0, ["title", "domain"]),
      detail: _.pick(v0, ["note"]),
      secret: {
        // We should never be dealing with a v0 login that encodes browser_state
        rawCredentials: _.pick(v0, ["username", "password"]),
      },
    };
  }

  public static previewToV1(v0: LoginPreviewV0): LoginPreviewV1 {
    return { info: v0 };
  }

  public static loginV1ToV0(v1: LoginV1): LoginCredentialsV0 {
    if (v1.secret.browserState) {
      throw new Error(
        "Can't map browser state v1 down to v0! Shouldn't be necessary!"
      );
    }

    return {
      ...v1.info,
      ...v1.secret.rawCredentials!,
    };
  }
}
