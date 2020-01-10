import * as srp from "secure-remote-password/client";
import api from "./graphqlApi";
import { base64ToUint8Array } from "./crypto";
import { PublicApi } from "./api";

function arrayBufferToHexString(arrayBuffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(arrayBuffer);
  let hexString = "";
  let nextHexByte: string;
  for (let i = 0; i < byteArray.byteLength; i += 1) {
    nextHexByte = byteArray[i].toString(16);
    if (nextHexByte.length < 2) {
      nextHexByte = "0" + nextHexByte;
    }
    hexString += nextHexByte;
  }
  return hexString;
}

function hexStringToArrayBuffer(string: string): ArrayBuffer {
  const matches = string.match(/[\da-f]{2}/gi);
  if (!matches) throw new Error("Invalid hex string?");
  const rawArr = matches.map((h) => parseInt(h, 16));
  const arr = new Uint8Array(rawArr);
  return arr.buffer;
}

const derivePrivateKey = async (
  email: string,
  password: string,
  salt: Uint8Array
): Promise<ArrayBuffer> => {
  // People sometimes enter emails with uppercase. That's fine for looking up their
  // account but it's not ok for that to vary in the cryptography...
  const lowercaseEmail = email.toLowerCase();

  const pbkdf2Key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(lowercaseEmail + ":" + password),
    { name: "PBKDF2", hash: "SHA-256" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const privateKey = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: { name: "SHA-256" },
    },
    pbkdf2Key,
    256
  );

  return privateKey;
};

export const toCreateAccountParams = async (
  email: string,
  password: string
) => {
  const srpSalt = srp.generateSalt();
  const srpPbkdf2Salt = crypto.getRandomValues(new Uint8Array(32));
  const masterKeyPbkdf2Salt = crypto.getRandomValues(new Uint8Array(32));
  const srpPrivateKey = arrayBufferToHexString(
    await derivePrivateKey(email, password, srpPbkdf2Salt)
  );

  const masterKey = await derivePrivateKey(
    email,
    password,
    masterKeyPbkdf2Salt
  );

  const srpVerifier = srp.deriveVerifier(srpPrivateKey);

  return {
    params: {
      email,
      srpPbkdf2Salt: arrayBufferToHexString(srpPbkdf2Salt),
      masterKeyPbkdf2Salt: arrayBufferToHexString(masterKeyPbkdf2Salt),
      srpSalt,
      srpVerifier,
    },
    masterKey,
  };
};

export interface SRPSession {
  id: string;
  key: string;
}

type SRPAuthOutcome =
  | {
      kind: "success";
      session: SRPSession;
      sessionWrapper: Uint8Array;
      masterKey: ArrayBuffer;
    }
  | { kind: "error"; message: string; status: number };

/**
 * Authenticates with the server using Secure Remote Password
 *
 * @returns {object} The derived session key and the session ID, when authentication was successful
 * @returns {null} When authentication failed
 */
export const srpAuthenticate = async (
  email: string,
  password: string
): Promise<SRPAuthOutcome> => {
  const ephemeral = srp.generateEphemeral();
  const {
    startSRPHandshake: { id, srpSalt, srpPbkdf2Salt, serverPublicEphemeral },
  } = await api.StartSRPHandshake({
    params: {
      email,
      clientPublicEphemeral: ephemeral.public,
    },
  });

  const srpPrivateKey = await derivePrivateKey(
    email,
    password,
    new Uint8Array(hexStringToArrayBuffer(srpPbkdf2Salt))
  );

  const clientSession = srp.deriveSession(
    ephemeral.secret,
    serverPublicEphemeral,
    srpSalt,
    email.toLowerCase(), // Email must be lowercase in crypto
    arrayBufferToHexString(srpPrivateKey)
  );

  try {
    const outcome = await new PublicApi().finishSRPHandshake({
      params: { id, clientProof: clientSession.proof },
    });

    if (outcome.kind !== "Success") {
      return {
        kind: "error",
        message: "That username and password didn't work",
        status: 401,
      };
    }

    const { finishSRPHandshake } = outcome.data;

    srp.verifySession(
      ephemeral.public,
      clientSession,
      finishSRPHandshake.serverProof
    );

    const sessionWrapper = base64ToUint8Array(
      finishSRPHandshake.sessionWrapper
    );

    const masterKey = await derivePrivateKey(
      email,
      password,
      new Uint8Array(
        hexStringToArrayBuffer(finishSRPHandshake.masterKeyPbkdf2Salt)
      )
    );

    return {
      kind: "success",
      session: {
        id,
        key: clientSession.key,
      },
      sessionWrapper,
      masterKey,
    };
  } catch (error) {
    console.error(error);
    return {
      kind: "error",
      message: error.message,
      status: error.response.status,
    };
  }
};
