import _ from "lodash";
import { Me, RsaEncryptedBlob } from "./api/graphql";
import { AppCrypto } from "./crypto";

export class CurrentUser {
  private decryptedPrivateKey: CryptoKey;
  private me: Me;
  private crypto: AppCrypto;

  static async create(me: Me, crypto: AppCrypto) {
    const decryptedPrivateKey = await crypto.unwrapPrivateKey(
      me.encryptedPrivateKey
    );

    return new CurrentUser({
      me,
      crypto,
      decryptedPrivateKey,
    });
  }

  private constructor({
    me,
    crypto,
    decryptedPrivateKey,
  }: {
    me: Me;
    crypto: AppCrypto;
    decryptedPrivateKey: CryptoKey;
  }) {
    this.decryptedPrivateKey = decryptedPrivateKey;
    this.me = me;
    this.crypto = crypto;
  }

  get id() {
    return this.me.id;
  }

  get publicKey() {
    return this.me.publicKey;
  }

  get emailVerified() {
    return this.me.emailVerified;
  }

  get isInBetaOnboarding() {
    return this.me.isInBetaOnboarding;
  }

  get avatarUrl() {
    return this.me.avatarUrl;
  }

  get email() {
    return this.me.email;
  }

  get username() {
    return this.me.username;
  }

  get forcedPasswordChangeEnabled() {
    return this.me.forcedPasswordChangeEnabled;
  }

  get privateKey() {
    return this.decryptedPrivateKey;
  }

  async exportablePrivateKey() {
    return this.crypto.unwrapPrivateKey(this.me.encryptedPrivateKey, {
      exportable: true,
    });
  }

  unwrapDataKey = _.memoize(
    async (encryptedDataKey: RsaEncryptedBlob) => {
      return this.crypto.unwrapDataKey(
        encryptedDataKey,
        this.decryptedPrivateKey
      );
    },
    (blob) => blob.ciphertext
  );

  unwrapDataKeys: (keys: RsaEncryptedBlob[]) => Promise<CryptoKey[]> = async (
    keys
  ) => Promise.all(keys.map((key) => this.unwrapDataKey(key)));
}
