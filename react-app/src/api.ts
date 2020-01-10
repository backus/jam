import { AuthenticatedApi, ApiReturnType } from "./graphqlApi";
import { AppCrypto } from "./crypto";
import {
  Me,
  RsaEncryptedBlob,
  GetInviteQuery,
  FinishSrpHandshakeInput,
  FinishSrpHandshakeMutation,
  MutationFinishSrpHandshakeArgs,
  WaitlistStatus,
  WaitlistEntry,
  AvatarUploadInstructions,
  LoginSchemaVersion,
  MagicLinkPulseState,
  AesEncryptedBlob,
  GetLoginPreviewTodoQuery,
  MyLogin,
  LoginType,
} from "./api/graphql";
import { TPotentialShare } from "./components/EditLogin";
import { LoginV1 } from "./types";
import publicGraphqlApi from "./graphqlApi";

import _ from "lodash";
import { ClientError } from "graphql-request";
import { CurrentUser } from "./CurrentUser";
import { ExpandRecursively, Expand } from "./generics";
import { DecryptedSocialGraphFriend } from "./components/ViewFriendship";

export interface IShareRecipientFriend {
  kind: "Friend";
  id: string;
  name: string;
  avatarUrl: string;
  publicKey: string;
}

export interface IShareRecipientInvite {
  kind: "Invite";
  id: string;
  name: string;
  dataKey: RsaEncryptedBlob;
}

export interface ILoginMemberStranger {
  kind: "Stranger";
  id: string;
  name: string;
  avatarUrl: string;
  publicKey: string;
}

export type TShareRecipient = IShareRecipientFriend | IShareRecipientInvite;
export type TLoginMember = TShareRecipient | ILoginMemberStranger;

export interface ILoginUpdate {
  login: LoginV1;
  newFriendShares: IShareRecipientFriend[];
  newInviteShares: IShareRecipientInvite[];
  revokedFriendShares: IShareRecipientFriend[];
  revokedInviteShares: IShareRecipientInvite[];
  sharePreviews: boolean;
}

const handleError = (error: Error | ClientError) => {
  if (!("response" in error)) throw error;
  if (!error.response.extensions?.handledError) throw error;

  const errorMessages: string[] = (error.response.errors || []).map((error) =>
    typeof error === "string" ? error : error.message
  );

  const errorLabel = (errorMessages || ["MissingError"])[0];

  // Translate "NotFound/Invite" -> "NotFound"
  const [errorType] = errorLabel.split("/", 1);

  return errorType as Exclude<TApiResponse["kind"], "Success">;
};

export class Api {
  private graphql: AuthenticatedApi;
  private crypto: AppCrypto;
  private currentUser: CurrentUser;

  constructor(params: {
    graphql: AuthenticatedApi;
    crypto: AppCrypto;
    currentUser: CurrentUser;
  }) {
    this.graphql = params.graphql;
    this.crypto = params.crypto;
    this.currentUser = params.currentUser;
  }

  async addFriend({
    id: userId,
    publicKey,
  }: {
    id: string;
    publicKey: string;
  }) {
    const result = await this.graphql.AddFriend({ userId });
    return result;
  }

  async getLoginPreviewTodo(): Promise<
    ExpandRecursively<GetLoginPreviewTodoQuery>
  > {
    return this.graphql.GetLoginPreviewTodo();
  }

  async signOut() {
    await this.graphql.SignOut();
    return true;
  }

  async createInvite(params: {
    nickname: string;
    phone: null | string;
    email: null | string;
  }) {
    const dataKey = await this.crypto.generateDataKey();
    const encryptedKey = await this.crypto.wrapDataKey(
      dataKey,
      this.currentUser.publicKey
    );
    const linkKey = await this.crypto.exportDataKeyAsBase64(dataKey);

    const { createInvite: id } = await this.graphql.CreateInvite({
      params: { key: encryptedKey, ...params },
    });

    return {
      id,
      linkKey,
      encryptedKey,
    };
  }

  async publishLoginPreviews(
    friendId: string,
    loginPreviewKeys: { loginId: string; previewKey: RsaEncryptedBlob }[]
  ) {
    return this.graphql.PublishLoginPreviews({
      params: { friendId, loginPreviewKeys },
    });
  }

  async publishLoginPreviewsForInvite(
    inviteId: string,
    loginPreviewKeys: { loginId: string; previewKey: AesEncryptedBlob }[]
  ) {
    return this.graphql.PublishLoginPreviewsForInvite({
      params: { inviteId, loginPreviewKeys },
    });
  }

  async preshareLogin({
    loginId,
    invitedFriend,
  }: {
    loginId: string;
    invitedFriend: { id: string; dataKey: RsaEncryptedBlob };
  }) {
    const {
      login: {
        credentialsKey: encryptedCredentialsKey,
        previewKey: encryptedPreviewKey,
      },
    } = await this.graphql.GetLogin({ id: loginId });

    const [
      previewKey,
      credentialsKey,
      sharedKey,
    ] = await this.currentUser.unwrapDataKeys([
      encryptedPreviewKey,
      encryptedCredentialsKey,
      invitedFriend.dataKey,
    ]);

    const [theirPreviewKey, theirCredentialsKey] = await Promise.all([
      this.crypto.wrapDataKeyWithSharedSecret(previewKey, sharedKey),
      this.crypto.wrapDataKeyWithSharedSecret(credentialsKey, sharedKey),
    ]);

    await this.graphql.PreshareLogin({
      params: {
        inviteId: invitedFriend.id,
        loginId,
        previewKey: theirPreviewKey,
        credentialsKey: theirCredentialsKey,
      },
    });
  }

  async getFriendWithShareGraph(
    id: string
  ): Promise<TApiResponse<DecryptedSocialGraphFriend>> {
    const { friend } = await this.graphql.GetFriendWithShareGraph({ id });
    if (!friend) return { kind: "NotFound" };

    const decryptPreviews = async (
      logins: {
        id: string;
        schemaVersion: LoginSchemaVersion;
        type: LoginType;
        preview: AesEncryptedBlob;
        previewKey: RsaEncryptedBlob;
      }[]
    ) =>
      Promise.all(
        logins.map(async (login) => {
          const preview = await this.crypto.decryptVersionedSharedLoginPreview(
            login.schemaVersion,
            login.preview,
            {
              encryptedDataKey: login.previewKey,
              privKey: this.currentUser.privateKey,
            }
          );

          return {
            ..._.omit(login, ["preview", "previewKey", "schemaVersion"]),
            preview,
          };
        })
      );

    const [
      loginsSharedWithThem,
      loginsSharedWithMe,
      loginPreviewsVisibleToThem,
      loginPreviewsVisibleToMe,
    ] = await Promise.all([
      decryptPreviews(friend.loginsSharedWithThem),
      decryptPreviews(friend.loginsSharedWithMe),
      decryptPreviews(friend.loginPreviewsVisibleToThem),
      decryptPreviews(friend.loginPreviewsVisibleToMe),
    ]);

    return {
      kind: "Success",
      data: {
        ...friend,
        loginsSharedWithThem,
        loginsSharedWithMe,
        loginPreviewsVisibleToThem,
        loginPreviewsVisibleToMe,
      },
    };
  }

  async getLogin(
    id: string
  ): Promise<TApiResponse<NonNullable<ApiReturnType<"GetLogin">["login"]>>> {
    try {
      const { login } = await this.graphql.GetLogin({
        id,
      });

      if (login) {
        return { kind: "Success", data: login };
      } else {
        return {
          kind: "NotFound",
        };
      }
    } catch (error) {
      return { kind: handleError(error) };
    }
  }

  async getPotentialShares(): Promise<TShareRecipient[]> {
    const { potentialShares } = await this.graphql.GetPotentialShares();

    return potentialShares.map((p) => p.friend);
  }

  async deleteInvite(id: string) {
    await this.graphql.DeleteInvite({ id });
  }

  async deleteLogin(id: string) {
    await this.graphql.DeleteLogin({ id });
  }

  async updateLoginData(id: string, change: ILoginUpdate) {
    const {
      login: {
        credentialsKey: encryptedCredentialsKey,
        previewKey: encryptedPreviewKey,
      },
    } = await this.graphql.GetLoginKeys({ id });

    const [credentialsKey, previewKey] = await this.currentUser.unwrapDataKeys([
      encryptedCredentialsKey,
      encryptedPreviewKey,
    ]);

    const [newCredentials, newPreview] = await Promise.all([
      this.crypto.encryptSharedLoginV1(change.login, credentialsKey),
      this.crypto.encryptSharedLoginPreviewV1(
        _.pick(change.login, ["info"]),
        previewKey
      ),
    ]);

    const newFriendShares = await Promise.all(
      change.newFriendShares.map(async (friend) => {
        const [theirPreviewKey, theirCredentialsKey] = await Promise.all([
          this.crypto.wrapDataKey(previewKey, friend.publicKey),
          this.crypto.wrapDataKey(credentialsKey, friend.publicKey),
        ]);

        return {
          id: friend.id,
          previewKey: theirPreviewKey,
          credentialsKey: theirCredentialsKey,
        };
      })
    );

    const newInviteShares = await Promise.all(
      change.newInviteShares.map(async (friend) => {
        const sharedKey = await this.currentUser.unwrapDataKey(friend.dataKey);

        const [theirPreviewKey, theirCredentialsKey] = await Promise.all([
          this.crypto.wrapDataKeyWithSharedSecret(previewKey, sharedKey),
          this.crypto.wrapDataKeyWithSharedSecret(credentialsKey, sharedKey),
        ]);

        return {
          id: friend.id,
          previewKey: theirPreviewKey,
          credentialsKey: theirCredentialsKey,
        };
      })
    );

    const revokedFriendShares = _.map(change.revokedFriendShares, "id");
    const revokedInviteShares = _.map(change.revokedInviteShares, "id");

    await this.graphql.UpdateLogin({
      params: {
        id,
        credentials: newCredentials,
        preview: newPreview,
        newFriendShares,
        newInviteShares,
        revokedFriendShares,
        revokedInviteShares,
        sharePreviews: change.sharePreviews,
        schemaVersion: LoginSchemaVersion.V1,
      },
    });
  }

  async updateAccount(changes: {
    username: string | null;
    avatarUrl: string | null;
  }) {
    return this.graphql.UpdateAccount(changes);
  }

  async recordMagicLinkUsage(
    id: string,
    state: "activating" | "success" | "fail"
  ): Promise<TApiResponse<null>> {
    try {
      await this.graphql.RecordMagicLinkUsage({
        id,
        state:
          state === "activating"
            ? MagicLinkPulseState.Activating
            : state === "success"
            ? MagicLinkPulseState.Success
            : MagicLinkPulseState.Fail,
      });
      return { kind: "Success", data: null };
    } catch (error) {
      return { kind: handleError(error) };
    }
  }
}

type TApiResponse<T = unknown> =
  | { kind: "NotFound" }
  | { kind: "Success"; data: T };

export class PublicApi {
  private graphql = publicGraphqlApi;

  async isUsernameAvailable(username: string) {
    const { available } = await this.graphql.IsUsernameAvailable({
      username,
    });
    return available;
  }

  async isEmailAvailable(email: string) {
    const { available } = await this.graphql.IsEmailAvailable({
      email,
    });
    return available;
  }

  async getInvite(id: string): Promise<TApiResponse<GetInviteQuery>> {
    try {
      const outcome = await this.graphql.GetInvite({ id });
      return { kind: "Success", data: outcome };
    } catch (error) {
      return { kind: handleError(error) };
    }
  }

  async finishSRPHandshake(
    data: MutationFinishSrpHandshakeArgs
  ): Promise<TApiResponse<FinishSrpHandshakeMutation>> {
    try {
      const outcome = await this.graphql.FinishSRPHandshake(data);
      return { kind: "Success", data: outcome };
    } catch (error) {
      return { kind: handleError(error) };
    }
  }

  async confirmWaitlist(secret: string): Promise<TApiResponse<WaitlistStatus>> {
    try {
      const { confirmWaitlist: outcome } = await this.graphql.ConfirmWaitlist({
        secret,
      });
      return { kind: "Success", data: outcome };
    } catch (error) {
      return { kind: handleError(error) };
    }
  }

  async waitlistEntry(
    id: string
  ): Promise<
    TApiResponse<
      NonNullable<ApiReturnType<"GetWaitlistEntry">["waitlistEntry"]>
    >
  > {
    try {
      const { waitlistEntry } = await this.graphql.GetWaitlistEntry({
        id,
      });

      if (waitlistEntry) {
        return { kind: "Success", data: waitlistEntry };
      } else {
        return {
          kind: "NotFound",
        };
      }
    } catch (error) {
      return { kind: handleError(error) };
    }
  }

  async unsubscribeFromWaitlist(id: string): Promise<TApiResponse<boolean>> {
    try {
      const { success } = await this.graphql.UnsubscribeFromWaitlist({
        id,
      });

      return { kind: "Success", data: success };
    } catch (error) {
      return { kind: handleError(error) };
    }
  }

  async getAvatarUploadUrl(): Promise<TApiResponse<AvatarUploadInstructions>> {
    try {
      const {
        getAvatarUploadUrl: urls,
      } = await this.graphql.GetAvatarUploadUrl();
      return { kind: "Success", data: urls };
    } catch (error) {
      return { kind: handleError(error) };
    }
  }
}
