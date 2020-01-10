import * as crypto from "crypto";
import * as Express from "express";
import {
  parseISO,
  differenceInSeconds,
  isValid as isValidDate,
} from "date-fns";
import { SRPHandshake, User } from "./models";
import { IncomingHttpHeaders } from "http";
import env from "./env";
import { isUuid } from "./utils";

interface IUnauthenticated {
  kind: "unauthenticated";
  authenticated: false;
}

interface IAuthFailed {
  kind: "failed";
  authenticated: false;
  message: string;
}

interface IAuthInvalid {
  kind: "invalid";
  authenticated: false;
  message: string;
}

interface IDigestValid {
  kind: "digest_valid";
}

export interface IAuthenticated {
  kind: "authenticated";
  authenticated: true;
  srpHandshake: SRPHandshake;
  user: User;
}

export type TAuthOutcome =
  | IUnauthenticated
  | IAuthFailed
  | IAuthInvalid
  | IAuthenticated;

type ExpressReq = Parameters<Express.RequestHandler>[0];

const unauthenticated: IUnauthenticated = {
  kind: "unauthenticated",
  authenticated: false,
};

const invalidAuth = (message: string): IAuthInvalid => ({
  kind: "invalid",
  authenticated: false,
  message,
});

const failedAuth = (message: string): IAuthFailed => ({
  kind: "failed",
  authenticated: false,
  message,
});

export const verifyDigestHeader = (
  headers: IncomingHttpHeaders,
  body: Buffer
): IAuthInvalid | IDigestValid => {
  const digestHeader = headers.digest;
  if (typeof digestHeader !== "string")
    return invalidAuth("Expected Digest header to be a string");

  const m = digestHeader.match(/^SHA-256=(?<digest>.+)$/);
  if (!m) return invalidAuth("Improperly formatted digest header");

  const { digest: providedDigest } = m.groups as { digest: string };

  const computedDigest = crypto
    .createHash("sha256")
    .update(body)
    .digest()
    .toString("base64");

  if (computedDigest !== providedDigest)
    return invalidAuth(
      "Provided digest does not match what the server computed!"
    );

  return { kind: "digest_valid" };
};

const graphiqlOverride = async (
  req: ExpressReq
): Promise<undefined | IAuthenticated> => {
  if (env.NODE_ENV !== "development")
    throw new Error(
      "Impersonation should NEVER be running outside of development"
    );

  const username = req.query.impersonate;
  if (!username) return;

  const user = await User.findOne({
    where: { username },
    include: ["srpHandshake"],
  });
  if (!user) throw new Error(`Can't find user with username '${username}'`);

  return {
    kind: "authenticated",
    authenticated: true,
    srpHandshake: user.srpHandshake,
    user,
  };
};

/**
 * Check the authentication of a request. We require that these headers are provided:
 *
 * - Digest
 * - X-Sent-At
 * - Authorization
 *
 * NOTE: We do not check whether the value of the Digest header is actually valid here.
 * We do that in the `verify` callback for bodyParser because that is the only place
 * we can access the raw body
 *
 * A valid request should look like this (just including relevant parts):
 *
 * POST /graphql HTTP/1.1
 * Authorization: Signature keyId="b76b4b8a-1903-472e-984d-1d3ccc0b918d",algorithm="hmac-sha256",headers="(request-target) x-sent-at digest",signature="XGuFGe4fLelXmtDJaRysO6+rYt4U57IC/S6QmpYtyFY="
 * Digest: SHA-256=UAava3HZN9AWLOREt5JsQOHefEG/fZ4drCy7eIHOgJo=
 * X-Sent-At: 2020-01-14T17:05:06-08:00
 *
 * {"query":"query AllUsers {\n  users {\n    email\n  }\n}\n"}
 *
 * Note:
 *
 * - The keyId is the UUID associated with the srpHandshake entry
 * - The signature is signing a payload formed by combining the HTTP method,
 *   the route, the digest header, and the x-sent-at header
 * - We check that the X-Sent-At header is ISO8601 and within 15 minutes in the past of the request
 * - We validate the signature using the SRP session stored with the handshake
 *
 * This is basically a minimal implementation of the http-signatures spec but we use
 * X-Sent-At instead of Date so that we can provide a date from a browser client
 * @see https://web-payments.org/specs/source/http-signatures/#rfc.section.3
 */
export const authenticate = async (req: ExpressReq): Promise<TAuthOutcome> => {
  if (env.NODE_ENV === "development") {
    try {
      const override = await graphiqlOverride(req);
      if (override) return override;
    } catch (error) {
      return invalidAuth(`Impersonation failed! ${error}`);
    }
  }

  if (!("authorization" in req.headers)) return unauthenticated;
  if (!("x-sent-at" in req.headers))
    return invalidAuth("Missing x-sent-at header");
  if (!("digest" in req.headers)) return invalidAuth("Missing digest header");

  const authHeader = req.headers.authorization || "";
  const authParts = authHeader.split(",");
  if (authParts.length !== 4)
    return invalidAuth("Poorly formed Authorization header");

  const m = authParts[0].match(/^Signature keyId="(?<keyId>[0-9a-f-]+?)"$/);

  if (!m)
    return invalidAuth("Couldn't extract signature from Authorization header");
  const srpHandshakeId = (m.groups as { keyId: string }).keyId;

  if (authParts[1] !== 'algorithm="hmac-sha256"')
    return invalidAuth("Invalid algorithm section on Authorization header");

  if (authParts[2] !== 'headers="(request-target) x-sent-at digest"')
    return invalidAuth("Invalid headers section on Authorization header");

  const sigMatch = authParts[3].match(/^signature="(?<signature>.+?)"$/);
  if (!sigMatch || !sigMatch.groups || !sigMatch.groups.signature)
    return invalidAuth("Failed to extract signature from Authorization header");

  const { signature: clientSignature } = sigMatch.groups;

  const sentAtHeader = req.headers["x-sent-at"];
  if (typeof sentAtHeader !== "string") {
    // Apparently this can also be an array according to TS?
    return invalidAuth("X-Sent-At header invalid");
  }

  if (!sentAtHeader.includes("T"))
    return invalidAuth("X-Sent-At header needs to include time");

  // We have to use a non-standard header (X-Sent-At) instead of Date
  // so we also use non-standard formatting (ISO8601) because it is easier
  // to be strict about parsing. ¯\_(ツ)_/¯
  const sentAt = parseISO(sentAtHeader);
  if (!isValidDate(sentAt))
    return invalidAuth("Invalid formatting for X-Sent-At");

  const now = new Date();
  const timeDiff = differenceInSeconds(now, sentAt);

  // Sometimes the user's clock is a tiny bit ahead of the server, so we allow it to be slightly negative
  if (timeDiff > 15 * 60 || timeDiff < -30) {
    env.bugsnag.notify("X-Sent-At is out of range", {
      user: { srpHandshakeId },
      metaData: {
        timeDiff,
        sentAtHeader,
        now: now.toString(),
      },
    });
    return invalidAuth("X-Sent-At is out of range");
  }

  const srpHandshake = await SRPHandshake.findByPk(srpHandshakeId, {
    include: [User],
  });

  if (!srpHandshake || !srpHandshake.isComplete())
    return failedAuth(`No session associated with ${srpHandshakeId}`);

  const reqSummary = [
    `(request-target): post ${req.url.toLowerCase()}`,
    `x-sent-at: ${req.headers["x-sent-at"]}`,
    `digest: ${req.headers.digest}`,
  ].join("\n");

  const serverSignature = crypto
    .createHmac("sha256", srpHandshake.sessionKey)
    .update(reqSummary)
    .digest()
    .toString("base64");

  if (serverSignature !== clientSignature)
    return failedAuth("Client's signature does not match server's!");

  return {
    kind: "authenticated",
    authenticated: true,
    srpHandshake,
    user: srpHandshake.user,
  };
};

/**
 * Validate the SRP Handshake ID in the signed cookies so we know which
 * payload to serve for the root route.
 *
 * @note this is NOT for authentication!
 */
export const isSrpCookieValid = async (
  cookie: string | undefined
): Promise<boolean> => {
  if (!cookie) return false;
  if (!isUuid(cookie)) {
    // This shouldn't happen since we set this value
    throw new Error("Invalid format for srpHandshakeId cookie?");
  }

  const record = await SRPHandshake.scope("complete").findByPk(cookie);

  return !!record;
};
