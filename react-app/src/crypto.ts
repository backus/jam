import { map } from "lodash";
import * as _ from "lodash";
import uuid from "uuid/v4";

import {
  AesEncryptedBlob,
  RsaEncryptedBlob,
  LoginSchemaVersion,
} from "./api/graphql";
import { Convert, LoginV1, LoginPreviewV1 } from "./types";
import { LoginMapper } from "./loginSchemaMapper";
import { Serializer } from "./types/serializer";

type Base64EncodedData = string;

interface EncryptedData {
  ciphertext: Base64EncodedData;
  iv: Base64EncodedData;
  salt: Base64EncodedData;
  algorithm: string;
}

// I hate these stupid unreadable function names
/**
 * @example base64Encode("Hello, world!") // "SGVsbG8sIHdvcmxkIQ=="
 */
const base64Encode = btoa;
/**
 * @example base64Decode("SGVsbG8sIHdvcmxkIQ==") // "Hello, world!"
 */
const base64Decode = atob;

const PBKDF2_ROUNDS = 250000;
const ALGORITHM = "AES-GCM";

export const base64ToUint8Array = (string: Base64EncodedData): Uint8Array =>
  new Uint8Array(map(base64Decode(string), (char) => char.charCodeAt(0)));

/**
 * String.fromCharCode(...) breaks ("RangeError: Maximum call stack size exceeded")
 * when the value passes a certain size so we chunk the encoding
 */
const fromCharCodeChunked = (value: Uint8Array): string => {
  let str = "";
  let from = 0;

  while (from < value.byteLength) {
    str += String.fromCharCode(...value.slice(from, from + 1024));
    from += 1024;
  }

  return str;
};

const uint8ArrayToBase64 = (value: Uint8Array) =>
  base64Encode(fromCharCodeChunked(value));

const aesGcmParams = (iv: Uint8Array, salt: Uint8Array): AesGcmParams => ({
  name: ALGORITHM,
  iv,
  additionalData: new TextEncoder().encode(
    `${uint8ArrayToBase64(iv)}${uint8ArrayToBase64(salt)}`
  ),
});

const deserializeAesEncryptedBlob = (data: AesEncryptedBlob) =>
  _.mapValues(_.pick(data, ["ciphertext", "iv", "salt"]), (value) =>
    base64ToUint8Array(value)
  );

export class AppCrypto {
  static async restore(
    wrappedMasterKey: EncryptedData,
    encodedWrapper: string
  ) {
    const wrapperRaw = base64ToUint8Array(encodedWrapper);
    const wrapper = await crypto.subtle.importKey(
      "raw",
      wrapperRaw,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );

    const { ciphertext, iv, salt } = deserializeAesEncryptedBlob(
      wrappedMasterKey
    );

    const keyMaterial = await crypto.subtle.decrypt(
      aesGcmParams(iv, salt),
      wrapper,
      ciphertext
    );

    return this.fromKeyMaterial(keyMaterial);
  }

  static async fromKeyMaterial(keyMaterial: ArrayBuffer) {
    const masterKey = await crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "PBKDF2", hash: "SHA-256" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return new AppCrypto(masterKey);
  }

  constructor(private masterKey: CryptoKey) {}

  async wrapPrivateKey(privKey: CryptoKey) {
    return this.wrapKey(privKey);
  }

  async wrapKeyMaterial(keyMaterial: ArrayBuffer, wrapperRaw: Uint8Array) {
    const wrapper = await crypto.subtle.importKey(
      "raw",
      wrapperRaw,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );

    const salt = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array;
    const iv = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array;

    const wrappedKey = await crypto.subtle.encrypt(
      aesGcmParams(iv, salt),
      wrapper,
      keyMaterial
    );

    return {
      ciphertext: uint8ArrayToBase64(new Uint8Array(wrappedKey)),
      iv: uint8ArrayToBase64(iv),
      salt: uint8ArrayToBase64(salt),
      algorithm: ALGORITHM,
    };
  }

  async createFriendReqKeysForNewAccount() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );

    const keyToBase64 = async (format: "spki" | "pkcs8", key: CryptoKey) =>
      btoa(
        String.fromCharCode(
          ...new Uint8Array(await crypto.subtle.exportKey(format, key))
        )
      );

    const publicKey = await keyToBase64("spki", keyPair.publicKey);
    const encryptedPrivateKey = await this.wrapKey(keyPair.privateKey);

    return {
      publicKey,
      encryptedPrivateKey,
    };
  }

  async generateDataKey() {
    return crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async wrapDataKeyWithSharedSecret(key: CryptoKey, sharedKey: CryptoKey) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const wrappedKey = await crypto.subtle.wrapKey(
      "jwk",
      key,
      sharedKey,
      aesGcmParams(iv, salt)
    );

    return {
      ciphertext: uint8ArrayToBase64(new Uint8Array(wrappedKey)),
      iv: uint8ArrayToBase64(iv),
      salt: uint8ArrayToBase64(salt),
      algorithm: ALGORITHM,
    };
  }

  async unwrapDataKeyWithSharedSecret(
    wrappedKey: AesEncryptedBlob,
    sharedKey: CryptoKey
  ) {
    const { ciphertext, iv, salt } = deserializeAesEncryptedBlob(wrappedKey);

    return crypto.subtle.unwrapKey(
      "jwk",
      ciphertext,
      sharedKey,
      aesGcmParams(iv, salt),
      { name: "AES-GCM" },
      true,
      ["decrypt"]
    );
  }

  async wrapDataKey(key: CryptoKey, serializedPubKey: string) {
    const buff = base64ToUint8Array(serializedPubKey);
    const pubKey = await crypto.subtle.importKey(
      "spki",
      buff,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt", "wrapKey"]
    );

    return {
      ciphertext: uint8ArrayToBase64(
        new Uint8Array(
          await crypto.subtle.wrapKey("raw", key, pubKey, {
            name: "RSA-OAEP",
          })
        )
      ),
      algorithm: "RSA-OAEP",
    };
  }

  /**
   * Returns the exported key, base64 encoded and then URL encoded
   *
   * @param key an AES link data key, for invites
   */
  async exportDataKeyAsBase64(key: CryptoKey) {
    const exported = await crypto.subtle.exportKey("raw", key);
    return encodeURIComponent(uint8ArrayToBase64(new Uint8Array(exported)));
  }

  /**
   * The return signature of this fn is going to differ from the rest, for now.
   * Since we're dealing with the key in a URL being passed around, there will likely
   * be plenty of malformed key errors. So, this function catches it's own errors then
   * returns what is effectively an Either type so the caller has to handle errors
   *
   * @param encodedKey base64 encoded key grabbed from accept invite URL
   */
  async importBase64DataKey(
    encodedKey: string
  ): Promise<
    { outcome: "success"; key: CryptoKey } | { outcome: "error"; error: Error }
  > {
    try {
      const key = await crypto.subtle.importKey(
        "raw",
        base64ToUint8Array(decodeURIComponent(encodedKey)),
        {
          name: "AES-GCM",
          length: 256,
        },
        false,
        ["unwrapKey"]
      );

      return { outcome: "success", key };
    } catch (error) {
      return { outcome: "error", error };
    }
  }

  async wrapKey(key: CryptoKey) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const subkey = await this.deriveSubkey(salt);

    const wrappedKey = await crypto.subtle.wrapKey(
      "jwk",
      key,
      subkey,
      aesGcmParams(iv, salt)
    );

    return {
      ciphertext: uint8ArrayToBase64(new Uint8Array(wrappedKey)),
      iv: uint8ArrayToBase64(iv),
      salt: uint8ArrayToBase64(salt),
      algorithm: ALGORITHM,
    };
  }

  async encryptSharedLoginV1(data: LoginV1, dataKey: CryptoKey) {
    return this.encryptWithSharedSecret(
      Serializer.loginV1ToJson(data),
      dataKey
    );
  }

  async encryptSharedLoginPreviewV1(data: LoginPreviewV1, dataKey: CryptoKey) {
    return this.encryptWithSharedSecret(
      Convert.loginPreviewV1ToJson(data),
      dataKey
    );
  }

  async decryptVersionedPresharedLoginPreview(
    version: LoginSchemaVersion,
    data: AesEncryptedBlob,
    dataKey: CryptoKey
  ): Promise<LoginPreviewV1> {
    const raw = await this.decryptWithSharedSecret(data, dataKey);

    if (version === LoginSchemaVersion.V1) return Convert.toLoginPreviewV1(raw);

    return LoginMapper.previewToV1(Convert.toLoginPreviewV0(raw));
  }

  async decryptVersionedSharedLoginPreview(
    version: LoginSchemaVersion,
    data: AesEncryptedBlob,
    options: { encryptedDataKey: RsaEncryptedBlob; privKey: CryptoKey }
  ): Promise<LoginPreviewV1> {
    const raw = await this.decryptWithEncryptedSharedSecret(data, options);

    if (version === LoginSchemaVersion.V1) return Convert.toLoginPreviewV1(raw);

    return LoginMapper.previewToV1(Convert.toLoginPreviewV0(raw));
  }

  async decryptVersionedSharedLoginCredentials(
    version: LoginSchemaVersion,
    data: AesEncryptedBlob,
    options: { encryptedDataKey: RsaEncryptedBlob; privKey: CryptoKey }
  ): Promise<LoginV1> {
    const raw = await this.decryptWithEncryptedSharedSecret(data, options);

    if (version === LoginSchemaVersion.V1) return Serializer.toLoginV1(raw);

    return LoginMapper.credentialsToV1(Convert.toLoginCredentialsV0(raw));
  }
  async unwrapPrivateKey(
    encryptedPrivKey: AesEncryptedBlob,
    options = { exportable: false }
  ) {
    const { ciphertext, iv, salt } = deserializeAesEncryptedBlob(
      encryptedPrivKey
    );
    const subkey = await this.deriveSubkey(salt);

    return crypto.subtle.unwrapKey(
      "jwk",
      ciphertext.buffer,
      subkey,
      aesGcmParams(iv, salt),
      { name: "RSA-OAEP", hash: "SHA-256" } as any,
      options.exportable,
      ["decrypt", "unwrapKey"]
    );
  }

  /**
   * @see PageState#isJamSession()
   */
  async verifySessionIdentity({
    input,
    output,
    salt: encodedSalt,
  }: {
    input: string;
    output: AesEncryptedBlob;
    salt: string;
  }) {
    const subkeySalt = base64ToUint8Array(encodedSalt);
    const subkey = await this.deriveSubkey(subkeySalt);

    const decrypted = await this.decryptWithSharedSecret(output, subkey);

    return decrypted === input;
  }

  /**
   * @see PageState#isJamSession()
   */
  async generateSessionIdentity() {
    const input = uuid();
    const subkeySalt = crypto.getRandomValues(new Uint8Array(16));
    const subkey = await this.deriveSubkey(subkeySalt);

    return {
      input: input,
      output: await this.encryptWithSharedSecret(input, subkey),
      salt: uint8ArrayToBase64(subkeySalt),
    };
  }

  private async encryptWithSharedSecret(
    serializedData: string,
    dataKey: CryptoKey
  ) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      aesGcmParams(iv, salt),
      dataKey,
      new TextEncoder().encode(serializedData)
    );

    return {
      ciphertext: uint8ArrayToBase64(new Uint8Array(ciphertext)),
      iv: uint8ArrayToBase64(iv),
      salt: uint8ArrayToBase64(salt),
      algorithm: ALGORITHM,
    };
  }

  private async decryptWithEncryptedSharedSecret(
    data: AesEncryptedBlob,
    {
      encryptedDataKey,
      privKey,
    }: { encryptedDataKey: RsaEncryptedBlob; privKey: CryptoKey }
  ): Promise<string> {
    const sharedSecret = await this.unwrapDataKey(encryptedDataKey, privKey);
    return this.decryptWithSharedSecret(data, sharedSecret);
  }

  private async decryptWithSharedSecret(
    data: AesEncryptedBlob,
    sharedSecret: CryptoKey
  ): Promise<string> {
    const { ciphertext, iv, salt } = deserializeAesEncryptedBlob(data);

    const original = await crypto.subtle.decrypt(
      aesGcmParams(iv, salt),
      sharedSecret,
      ciphertext
    );

    return new TextDecoder().decode(original);
  }

  /**
   * @deprecated Use `CurrentUser#unwrapDataKey` since it is memoized!
   */
  async unwrapDataKey(encryptedDataKey: RsaEncryptedBlob, privKey: CryptoKey) {
    return crypto.subtle.unwrapKey(
      "raw",
      base64ToUint8Array(encryptedDataKey.ciphertext).buffer,
      privKey /* my private key */,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      } as any,
      { name: "AES-GCM", length: 256 } as any,
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
  }

  private async deriveSubkey(salt: Uint8Array) {
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ROUNDS,
        hash: "SHA-256",
      },
      this.masterKey,
      { name: ALGORITHM, length: 256 },
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
  }
}
