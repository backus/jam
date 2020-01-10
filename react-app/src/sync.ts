import { LoadedApp } from "./AppContainer";
import * as _ from "lodash";
import { RsaEncryptedBlob, AesEncryptedBlob } from "./api/graphql";
import { AppCrypto } from "./crypto";
import { Api } from "./api";

class FriendPreviewSync {
  public logins: { id: string; previewKey: CryptoKey }[];
  public id: string;
  public publicKey: string;

  static async decrypt({
    id,
    publicKey,
    logins,
    invite,
    unwrapKey,
  }: {
    id: string;
    publicKey: string;
    logins: { id: string; previewKey: RsaEncryptedBlob }[];
    invite: { loginShares: { id: string }[] } | null;
    unwrapKey: (blob: RsaEncryptedBlob) => Promise<CryptoKey>;
  }) {
    // Ugly hack, but if someone accepts an invite without the shared key in the URL
    // we need to share that full login offer. Since it isn't associated with the user
    // yet, the loginPreviewTodos resolver also returns ids for these logins. So, we need
    // to reach into the user's invite's loginShares and filter out logins that are in there
    const fullShareInviteTodos = invite?.loginShares.map((s) => s.id) || [];
    const decryptedLogins = await Promise.all(
      logins
        .filter((login) => !fullShareInviteTodos.includes(login.id))
        .map(async (login) => ({
          id: login.id,
          previewKey: await unwrapKey(login.previewKey),
        }))
    );

    return new FriendPreviewSync({
      logins: decryptedLogins,
      publicKey: publicKey,
      id: id,
    });
  }

  private constructor({
    logins,
    id,
    publicKey,
  }: {
    logins: { id: string; previewKey: CryptoKey }[];
    id: string;
    publicKey: string;
  }) {
    this.logins = logins;
    this.id = id;
    this.publicKey = publicKey;
  }

  async publish(api: Api, crypto: AppCrypto) {
    if (this.logins.length === 0) return Promise.resolve();

    const newLoginPreviewKeys = await Promise.all(
      this.logins.map(async (login) => ({
        loginId: login.id,
        previewKey: await crypto.wrapDataKey(login.previewKey, this.publicKey),
      }))
    );

    return api.publishLoginPreviews(this.id, newLoginPreviewKeys);
  }
}

class InvitePreviewSync {
  public logins: { id: string; previewKey: CryptoKey }[];
  public id: string;
  public key: CryptoKey;

  static async decrypt({
    id,
    key,
    logins,
    unwrapKey,
  }: {
    id: string;
    key: CryptoKey;
    logins: { id: string; previewKey: RsaEncryptedBlob }[];
    unwrapKey: (blob: RsaEncryptedBlob) => Promise<CryptoKey>;
  }) {
    const decryptedLogins = await Promise.all(
      logins.map(async (login) => ({
        id: login.id,
        previewKey: await unwrapKey(login.previewKey),
      }))
    );

    return new InvitePreviewSync({
      logins: decryptedLogins,
      key,
      id: id,
    });
  }

  private constructor({
    logins,
    id,
    key,
  }: {
    logins: { id: string; previewKey: CryptoKey }[];
    id: string;
    key: CryptoKey;
  }) {
    this.logins = logins;
    this.id = id;
    this.key = key;
  }

  async publish(api: Api, crypto: AppCrypto) {
    if (this.logins.length === 0) return Promise.resolve();

    const newLoginPreviewKeys = await Promise.all(
      this.logins.map(async (login) => ({
        loginId: login.id,
        previewKey: await crypto.wrapDataKeyWithSharedSecret(
          login.previewKey,
          this.key
        ),
      }))
    );

    return api.publishLoginPreviewsForInvite(this.id, newLoginPreviewKeys);
  }
}

export const syncLoginAccessKeys = async (app: LoadedApp) => {
  const { crypto, currentUser } = app.state;

  const {
    friends,
    friendRequests,
    invites,
  } = await app.api().getLoginPreviewTodo();

  const untransitionedShareOffers = friends.flatMap(
    ({ id: friendId, publicKey, invite }) => {
      if (!invite) return [];

      return invite.loginShares.map(
        ({
          id: loginId,
          credentialsKey,
          previewKey,
        }): {
          friend: { id: string; publicKey: string };
          loginId: string;
          inviteKey: RsaEncryptedBlob;
          previewKey: AesEncryptedBlob;
          credentialsKey: AesEncryptedBlob;
        } => {
          if (!credentialsKey)
            throw new Error(
              "Expected only full login shares to be returned for TODO sync!"
            );

          return {
            friend: { id: friendId, publicKey },
            inviteKey: invite.key,
            loginId,
            previewKey,
            credentialsKey,
          };
        }
      );
    }
  );

  const friendPreviewSyncs = await Promise.all(
    friends
      .map(async (friend) =>
        FriendPreviewSync.decrypt({
          ...friend,
          unwrapKey: currentUser.unwrapDataKey,
        })
      )
      .concat(
        friendRequests.map(async ({ recipient, logins }) =>
          FriendPreviewSync.decrypt({
            id: recipient.id,
            publicKey: recipient.publicKey,
            logins,
            invite: null,
            unwrapKey: currentUser.unwrapDataKey,
          })
        )
      )
  );

  const invitePreviewSyncs = await Promise.all(
    invites.map(async (invite) =>
      InvitePreviewSync.decrypt({
        ...invite,
        key: await currentUser.unwrapDataKey(invite.key),
        unwrapKey: currentUser.unwrapDataKey,
      })
    )
  );

  await Promise.all(
    untransitionedShareOffers.map(async (shareOffer) => {
      const inviteKey = await currentUser.unwrapDataKey(shareOffer.inviteKey);
      const previewKey = await crypto.unwrapDataKeyWithSharedSecret(
        shareOffer.previewKey,
        inviteKey
      );
      const credentialsKey = await crypto.unwrapDataKeyWithSharedSecret(
        shareOffer.credentialsKey,
        inviteKey
      );

      const [theirPreviewKey, theirCredentialsKey] = await Promise.all([
        crypto.wrapDataKey(previewKey, shareOffer.friend.publicKey),
        crypto.wrapDataKey(credentialsKey, shareOffer.friend.publicKey),
      ]);

      await app.graphql().ShareLogin({
        params: {
          friendId: shareOffer.friend.id,
          loginId: shareOffer.loginId,
          previewKey: theirPreviewKey,
          credentialsKey: theirCredentialsKey,
        },
      });
    })
  );

  await Promise.all(
    friendPreviewSyncs.map((sync) => sync.publish(app.api(), crypto))
  );

  await Promise.all(
    invitePreviewSyncs.map((sync) => sync.publish(app.api(), crypto))
  );
};
