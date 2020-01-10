import { Container } from "unstated";
import { SRPSession } from "./srp";
import { hmacApi, ApiReturnType } from "./graphqlApi";
import { AppCrypto } from "./crypto";
import {
  AesEncryptedBlob,
  LoginSchemaVersion,
  LoginType,
  Me,
} from "./api/graphql";
import * as _ from "lodash";
import { syncLoginAccessKeys } from "./sync";
import { LoginV1, Convert } from "./types";
import {
  Api,
  TShareRecipient,
  IShareRecipientFriend,
  IShareRecipientInvite,
} from "./api";
import { addToBugsnagUser } from "./bugsnagUser";
import { CurrentUser } from "./CurrentUser";

type MasterPassword = any;

interface Unauthenticated {
  kind: "app/unauthenticated";
  loading: boolean;
}

interface Authenticated {
  kind: "app/authenticated";
  crypto: AppCrypto;
  srpSession: SRPSession;
  loading: boolean;
}

interface Loaded extends Omit<Authenticated, "kind"> {
  kind: "app/loaded";
  currentUser: CurrentUser;
  loading: boolean;
}

declare global {
  interface Window {
    heap: {
      identify: (id: any) => void;
    };
  }
}

export type LoadedApp = AppContainer & Container<Loaded>;

export type AppState = Unauthenticated | Authenticated | Loaded;

export type AuthenticatedAppContainer = Container<Loaded>;
export class AppContainer extends Container<AppState> {
  state: AppState = { kind: "app/unauthenticated", loading: true };

  constructor() {
    super();

    this.attemptSessionRestore();
  }

  async attemptSessionRestore() {
    const localSession = localStorage.getItem("@jam/auth");
    if (!localSession) {
      this.setState({ loading: false });
      return;
    }

    try {
      const session: {
        srpSession: SRPSession;
        wrappedKeyMaterial: AesEncryptedBlob;
      } = Convert.toLocalAuthSession(localSession);

      const privateApi = hmacApi(session.srpSession);
      const { sessionWrapper } = await privateApi.MySessionWrapper();

      if (!sessionWrapper) throw new Error("session wrapper null?");

      const crypto = await AppCrypto.restore(
        session.wrappedKeyMaterial,
        sessionWrapper
      );

      this.setSession(session.srpSession, crypto);
    } catch (error) {
      // This should only happen if the associated session was deleted on the server
      console.error("Error restoring session: ", error);
      localStorage.removeItem("@jam/auth");
      this.setState({ kind: "app/unauthenticated", loading: false });
    }
  }

  isLoaded(): this is Container<Loaded> {
    return this.state.kind === "app/loaded";
  }

  assertLoaded() {
    if (!this.isLoaded()) throw new Error("Expected loaded app!");
    return this;
  }

  isAuthenticated(): this is AuthenticatedAppContainer {
    return this.state.kind === "app/authenticated";
  }

  signOut = async () => {
    // Tell server to clear session
    await this.api().signOut();

    localStorage.clear();
    sessionStorage.clear();

    this.setState({ loading: false, kind: "app/unauthenticated" });
  };

  async authenticated(props: {
    srpSession: SRPSession;
    sessionWrapper: Uint8Array;
    masterKey: ArrayBuffer;
  }) {
    const crypto = await AppCrypto.fromKeyMaterial(props.masterKey);
    const wrappedKeyMaterial = await crypto.wrapKeyMaterial(
      props.masterKey,
      props.sessionWrapper
    );
    localStorage.setItem(
      "@jam/auth",
      Convert.localAuthSessionToJson({
        srpSession: props.srpSession,
        wrappedKeyMaterial,
      })
    );

    return this.setSession(props.srpSession, crypto);
  }

  async addLogin({
    details,
    shareWith,
    sharePreviews,
    type,
  }: {
    details: LoginV1;
    shareWith: TShareRecipient[];
    sharePreviews: boolean;
    type: LoginType;
  }) {
    if (this.state.kind !== "app/loaded") throw new Error("ugh");

    const { crypto, currentUser } = this.state;

    const [credentialsDataKey, previewDataKey] = await Promise.all([
      crypto.generateDataKey(),
      crypto.generateDataKey(),
    ]);

    const [credentials, preview] = await Promise.all([
      crypto.encryptSharedLoginV1(details, credentialsDataKey),
      crypto.encryptSharedLoginPreviewV1(
        { info: details.info },
        previewDataKey
      ),
    ]);

    const [credentialsKey, previewKey] = await Promise.all([
      crypto.wrapDataKey(credentialsDataKey, currentUser.publicKey),
      crypto.wrapDataKey(previewDataKey, currentUser.publicKey),
    ]);

    const friendShares = await Promise.all(
      (shareWith.filter(
        (friend) => friend.kind === "Friend"
      ) as IShareRecipientFriend[]).map(async (friend) => {
        const [theirPreviewKey, theirCredentialsKey] = await Promise.all([
          crypto.wrapDataKey(previewDataKey, friend.publicKey),
          crypto.wrapDataKey(credentialsDataKey, friend.publicKey),
        ]);

        return {
          id: friend.id,
          previewKey: theirPreviewKey,
          credentialsKey: theirCredentialsKey,
        };
      })
    );

    const inviteShares = await Promise.all(
      (shareWith.filter(
        (friend) => friend.kind === "Invite"
      ) as IShareRecipientInvite[]).map(async (friend) => {
        const sharedKey = await currentUser.unwrapDataKey(friend.dataKey);
        const [theirPreviewKey, theirCredentialsKey] = await Promise.all([
          crypto.wrapDataKeyWithSharedSecret(previewDataKey, sharedKey),
          crypto.wrapDataKeyWithSharedSecret(credentialsDataKey, sharedKey),
        ]);

        return {
          id: friend.id,
          previewKey: theirPreviewKey,
          credentialsKey: theirCredentialsKey,
        };
      })
    );

    return this.graphql().CreateNewLogin({
      params: {
        credentials,
        preview,
        credentialsKey,
        previewKey,
        friendShares,
        inviteShares,
        sharePreviews,
        schemaVersion: LoginSchemaVersion.V1,
        type,
      },
    });
  }

  api() {
    if (!this.isAuthenticated() && !this.isLoaded()) {
      throw new Error(`Expected state to be kind/authenticated or kind/loaded`);
    }

    return new Api({
      graphql: this.graphql(),
      crypto: this.state.crypto,
      currentUser: this.state.currentUser,
    });
  }

  graphql() {
    if (!this.isAuthenticated() && !this.isLoaded()) {
      throw new Error(`Expected state to be kind/authenticated or kind/loaded`);
    }
    return hmacApi(this.state.srpSession);
  }

  async reloadMe() {
    const { me } = await this.getMe();
    await this.setCurrentUser(me, this.assertLoaded().state.crypto);
  }

  async syncLoginAccessKeys(): Promise<void> {
    return syncLoginAccessKeys(this.assertLoaded()).catch((error) => {
      console.error("Failed to sync login keys!", error);
      throw error;
    });
  }

  private async setSession(srpSession: SRPSession, crypto: AppCrypto) {
    await this.setState({
      kind: "app/authenticated",
      srpSession: srpSession,
      crypto,
    });

    const { me } = await this.getMe();
    await this.setCurrentUser(me, crypto);

    localStorage.setItem(
      "@jam/identity",
      JSON.stringify(await crypto.generateSessionIdentity())
    );

    await this.setState(
      {
        loading: false,
        kind: "app/loaded",
      },
      () => {
        const self = this.assertLoaded();
        if (self.state.currentUser.emailVerified) {
          this.syncLoginAccessKeys();
        }
      }
    );

    return this.assertLoaded();
  }

  private async setCurrentUser(me: Me, crypto: AppCrypto): Promise<void> {
    const currentUser = await CurrentUser.create(me, crypto);
    window.heap?.identify(currentUser.email);

    await this.setState({ currentUser });

    return;
  }

  private async getMe() {
    const { me } = await this.graphql().GetMe([]);

    addToBugsnagUser({
      id: me.id,
      email: me.email,
      username: me.username,
      emailVerified: me.emailVerified,
      isInBetaOnboarding: me.isInBetaOnboarding,
    });

    return { me };
  }
}
