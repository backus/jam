import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import * as Express from "express";
import chalk from "chalk";
import graphqlHTTP from "express-graphql";
import { buildSchema, GraphQLError } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import {
  User,
  SRPHandshake,
  Login,
  LoginAccess,
  FriendRequest,
  Friend,
  sequelize,
  Invite,
  EmailVerification,
  WaitlistEntry,
  LoginData,
  InviteLoginAccess,
  withinTransaction,
} from "./models";
import uuidv4 from "uuid/v4";
import * as crypto from "crypto";
import * as fs from "fs";
import {
  Resolvers,
  QueryResolvers,
  MutationResolvers,
  CreateUserInput,
  StartSrpHandshakeInput,
  FinishSrpHandshakeInput,
  ShareLoginInput,
  AcceptInviteInput,
  LoginPreviewsInput,
  SrpStartHandshakeResponse,
  Login as GraphqlLogin,
  WaitlistStatus as WaitlistStatusGraphql,
  PotentialShare,
  ApproveShareRequestInput,
  CreateLoginInput,
  AcceptBetaInviteInput,
  MagicLinkPulseState,
  MyLogin,
  SharedLogin,
  InviteResolvers,
  FriendResolvers,
  MyLoginResolvers,
  SharedLoginResolvers,
} from "./resolvers";
import * as GraphQLResolvers from "./resolvers";

import * as srp from "secure-remote-password/server";
import {
  authenticate,
  verifyDigestHeader,
  IAuthenticated,
  isSrpCookieValid,
} from "./authentication";
import { Op, Transaction } from "sequelize";
import S3 from "aws-sdk/clients/s3";
import env from "./env";
import {
  clearBugsnagSession,
  addToBugsnagUser,
  addToBugsnagMetadata,
} from "./addToBugsnag";
import * as R from "ramda";
import * as _ from "lodash";
import * as path from "path";
import helmet from "helmet";
import {
  friendNotificationEmailQueue,
  friendInviteEmailQueue,
  verifyWaitlistEmailQueue,
} from "./queue";
import { loginPreviewTodo } from "./queries/loginPreviewTodo";
import { logGraphqlError } from "./logGraphqlError";
import {
  allMembersOf,
  shareLoginWithFriends,
  shareLoginWithInvitedFriends,
  userMembersOf,
} from "./db/loginMembers";
import { AppError, AppReqError, requestError, RequestErrorFn } from "./error";
import { formatISO } from "date-fns";
import { slackPulse } from "./pulse";
import { WaitlistStatus } from "./models/WaitlistEntry";
import { InviteStatus } from "./models/Invite";
import InviteResolver from "./resolvers/Invite";
import FriendResolver from "./resolvers/Friend";
import MyLoginResolver from "./resolvers/MyLogin";
import SharedLoginResolver from "./resolvers/SharedLogin";
import PendingOutboundFriendRequestResolver from "./resolvers/PendingOutboundFriendRequest";
import { isUuid } from "./utils";

const { UI: BullBoardUI } = require("bull-board");
const basicAuth = require("express-basic-auth");

const bugsnagExpress = require("@bugsnag/plugin-express");
env.bugsnag.use(bugsnagExpress);

const typeDefs = fs.readFileSync("./server/server.graphql", "utf8");

export const enforceHTTPS: express.RequestHandler = async (req, res, next) => {
  let isHTTPS = req.secure;

  // Second, if the request headers can be trusted (e.g. because they are send
  // by a proxy), check if x-forward-proto is set to https
  if (!isHTTPS) {
    const xForwardProto = (req.headers["x-forwarded-proto"] as string) || "";
    isHTTPS = xForwardProto.substring(0, 5) === "https";
  }
  if (isHTTPS) {
    return next();
  }
  // Only redirect GET methods
  if (req.method === "GET" || req.method === "HEAD") {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  } else {
    res
      .status(403)
      .send("Please use HTTPS when submitting data to this server.");
  }
};

export const enforceNoWww: express.RequestHandler = async (req, res, next) => {
  const host = req.headers.host || "";
  if (host.slice(0, 4) === "www.") {
    var newHost = host.slice(4);
    return res.redirect(301, req.protocol + "://" + newHost + req.originalUrl);
  }
  next();
};

const app = express();

const bugsnagMiddleware = env.bugsnag.getPlugin("express");

app.use(bugsnagMiddleware.requestHandler);

// Sets "Strict-Transport-Security: max-age=5184000; includeSubDomains".
const sixtyDaysInSeconds = 5184000;

app.use(
  helmet.hsts({
    maxAge: sixtyDaysInSeconds,
    includeSubDomains: true,
    preload: true,
  })
);

if (env.isProd()) {
  app.use(enforceHTTPS);
  app.use(enforceNoWww);
}

app.use(
  bodyParser.json({
    limit: "1mb",
    verify: (req, _, buffer) => {
      if (!("digest" in req.headers)) return;

      const outcome = verifyDigestHeader(req.headers, buffer);

      if (outcome.kind !== "digest_valid") {
        env.bugsnag.notify(new Error("Invalid digest submitted"));
        throw new AppReqError("AuthenticationFailed/InvalidDigest");
      }
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

const APP_REQ_AUTH_KEY = "@jam/auth";

type ExpressReq = Parameters<Express.RequestHandler>[0];
type ExpressRes = Parameters<Express.RequestHandler>[1];
type AuthenticationResult = { authenticated: false } | IAuthenticated;
type AuthProcessedRequest = ExpressReq & {
  [APP_REQ_AUTH_KEY]: AuthenticationResult;
};

app.use(cookieParser(env.cookieSecret));

app.use(async (req, res, next) => {
  if (req.path.startsWith(`/${env.adminPath}`)) {
    next();
    return;
  }

  if (APP_REQ_AUTH_KEY in req) {
    throw new Error("Authentication key already set on request?");
  }

  const outcome = await authenticate(req);

  if (outcome.kind === "authenticated") {
    // Track last active date
    await outcome.user.touch();

    // We set this cookie so we know what to serve at server root, not for authentication
    res.cookie("srpHandshakeId", outcome.srpHandshake.id, { signed: true });
  }

  (req as AuthProcessedRequest)[APP_REQ_AUTH_KEY] = outcome;

  if (outcome.kind === "failed" || outcome.kind === "invalid") {
    // Halts the request with the error message
    next(new AppReqError("AuthenticationFailed"));
  } else {
    next();
  }

  return;
});

const getAuth = (req: AuthProcessedRequest): AuthenticationResult =>
  req[APP_REQ_AUTH_KEY];

const requireAuth = (req: AuthProcessedRequest) => {
  const authResult = getAuth(req);
  if (!authResult.authenticated) throw new AppReqError("Unauthorized");

  return authResult;
};

export const requireVerifiedUser = (req: AuthProcessedRequest) => {
  const authResult = requireAuth(req);
  if (!authResult.user.emailVerified)
    throw new AppReqError("Unauthorized/EmailNotVerified");

  return authResult;
};

app.use((req, res, next) => {
  clearBugsnagSession();

  const authResult = getAuth(req as AuthProcessedRequest);
  if (authResult && authResult.authenticated) {
    addToBugsnagUser(
      _.pick(authResult.user, [
        "id",
        "email",
        "username",
        "lastActiveAt",
        "avatarUrl",
        "isInBetaOnboarding",
        "emailVerified",
      ])
    );
  }

  addToBugsnagMetadata({
    request: {
      path: req.path,
      method: req.method,
      ip: req.ip,
    },
  });

  next();
});

const s3 = new S3({
  region: env.AWS_REGION,
  apiVersion: "2006-03-01",
  accessKeyId: env.AWS_ACCESS_KEY,
  secretAccessKey: env.AWS_SECRET_KEY,
});

export function assertNever(...args: never[]): never {
  throw new Error(
    "Unexhaustive case statement! assertNever was called with " +
      args.toString()
  );
}

// Require that every root Query and Mutation is implemented, but don't required that for
// nested resolvers for different types
type TResolvers = {
  Query: Required<QueryResolvers>;
  Mutation: Required<MutationResolvers>;
  Invite: typeof InviteResolver;
  Friend: typeof FriendResolver;
  MyLogin: typeof MyLoginResolver;
  SharedLogin: typeof SharedLoginResolver;
  PendingOutboundFriendRequest: typeof PendingOutboundFriendRequestResolver;
  ShareRecipient: Resolvers["ShareRecipient"];
};

const resolvers: TResolvers = {
  Query: {
    time: () => formatISO(new Date()),
    getAvatarUploadUrl: async () => {
      const name = `${uuidv4()}.jpg`;
      const avatarUrl = `https://${env.S3_AVATARS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${name}`;

      const uploadUrl = await s3.getSignedUrlPromise("putObject", {
        Bucket: env.S3_AVATARS_BUCKET,
        Key: name,
        Expires: 300, // 5 min
        ContentType: "image/jpeg",
        ACL: "public-read",
      });

      return { avatarUrl, uploadUrl };
    },
    isUsernameAvailable: async (_parent, { username }, _ctx) => {
      const user = await User.findOne({ where: { username } });

      return !user;
    },
    isEmailAvailable: async (_parent, { email }, _ctx) => {
      const user = await User.findOne({ where: { email } });

      return !user;
    },
    sessionWrapper: async (_parent, _args, ctx) => {
      const { srpHandshake } = requireAuth(ctx.req);
      return srpHandshake.sessionWrapper;
    },
    waitlistEntry: async (_parent, { id }) => {
      const entry = await WaitlistEntry.findInvite(id);
      if (!entry) return null;

      await slackPulse(`${entry.email} viewed their beta invite`);

      return entry;
    },
    me: async (_parent, _args, ctx) => {
      const { user } = requireAuth(ctx.req);
      return user;
    },
    friend: async (_parent, { id }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      if (!isUuid(id)) return null;
      const friendship = await Friend.findOne({
        where: { userId: user.id, friendId: id },
        include: ["friend"],
      });

      if (!friendship) return null;

      return friendship.friend;
    },
    friends: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const results = await Friend.findAll({
        where: { userId: user.id },
        include: ["friend"],
      });
      return results.map((friendModel) => friendModel.friend);
    },
    findFriends: async (_parent, { search }: { search: string }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      if (R.trim(search).length <= 2) return [];
      return user.searchStrangers(search);
    },
    pendingInboundFriendRequest: async (
      _parent,
      { id }: { id: string },
      ctx
    ) => {
      const { user } = requireVerifiedUser(ctx.req);
      const result = await FriendRequest.findOne({
        where: { id, recipientId: user.id, status: "pending" },
      });
      if (!result) {
        ctx.error("NotFound/FriendRequest");
        return assertNever();
      }
      return result;
    },
    pendingInboundFriendRequests: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const results = await FriendRequest.findAll({
        where: { recipientId: user.id, status: "pending" },
        include: ["initiator"],
      });
      return results;
    },
    invite: async (_parent, { id }, ctx) => {
      const invite = await Invite.findOne({
        where: { status: "pending", id },
        include: ["from"],
      });
      if (!invite) {
        ctx.error("NotFound/Invite");
        return assertNever();
      }
      return invite;
    },
    pendingOutboundFriendRequests: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const results = await user.pendingOutboundFriendRequests();
      return results;
    },
    login: async (_parent, { id }: { id: string }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      let login: Login | null = null;

      try {
        login = await Login.findOne({
          where: {
            id,
            memberId: user.id,
            status: { [Op.in]: ["shared", "manager"] },
          },
        });
      } catch (error) {
        if (error.message.startsWith("invalid input syntax for type uuid")) {
          ctx.error("NotFound/Login");
          return assertNever();
        }

        throw error;
      }

      if (!login) {
        ctx.error("NotFound/Login");
        return assertNever();
      }

      return {
        __typename: login.managerId === user.id ? "MyLogin" : "SharedLogin",
        id: login.id,
        createdAt: login.createdAt,
        updatedAt: login.updatedAt,
        credentials: login.credentials,
        preview: login.preview,
        credentialsKey: login.credentialsKey,
        previewKey: login.previewKey,
        sharePreviews: login.sharePreviews,
        schemaVersion: login.schemaVersion,
        type: login.type,
      };
    },

    myLogins: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      return Login.findAll({
        where: { managerId: user.id, status: "manager" },
      });
    },
    loginPreviewTodo: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      return loginPreviewTodo(user.id);
    },
    loginsSharedWithMe: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      return Login.findAll({
        where: { memberId: user.id, status: "shared" },
        include: ["manager"],
      });
    },
    // TODO: Revisit with Login resolver
    loginPreviews: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const previews = await Login.previewsFor(user.id);
      return previews.map((preview) => preview.toSummary());
    },
    loginPreview: async (_parent, { id }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const login = await Login.findOne({
        where: {
          memberId: user.id,
          id,
          status: { [Op.in]: ["preview", "request/pending", "request/denied"] },
        },
        include: ["manager"],
      });
      if (!login) throw new Error("Not found");

      return login.toSummary();
    },

    loginShareRequests: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      return Login.pendingRequestsFor(user.id);
    },
    pendingLoginShares: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      return Login.findAll({
        where: { memberId: user.id, status: "offer/pending" },
        include: ["manager"],
      });
    },
    potentialShares: async (_parent, { id }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      let excludeFriendIds: string[] = [];
      let excludeInviteIds: string[] = [];

      if (id) {
        const login = await Login.findOne({
          where: { managerId: user.id, status: "manager", id },
        });
        if (!login) {
          ctx.error("NotFound/Login");
          return assertNever();
        }

        excludeFriendIds = await login.userIdsSharingWith();
        excludeInviteIds = await login.inviteIdsSharingWith();
      }

      const friendships = await Friend.findAll({
        where: { userId: user.id, friendId: { [Op.notIn]: excludeFriendIds } },
        include: ["friend"],
      });
      const sharingWithMeStats = await user.sharingWithMeStats();

      const invitedFriends = await Invite.findAll({
        where: {
          fromId: user.id,
          status: "pending",
          id: { [Op.notIn]: excludeInviteIds },
        },
      });

      return [
        ...friendships.map((f) => ({
          friend: {
            __typename: "Friend" as "Friend",
            ..._.pick(f.friend, [
              "id",
              "createdAt",
              "username",
              "publicKey",
              "email",
              "avatarUrl",
            ]),
          },
          numSharing: sharingWithMeStats[f.friendId] || 0,
        })),
        ...invitedFriends.map((invite) => ({
          friend: {
            __typename: "Invite" as "Invite",
            ..._.pick(invite, ["id", "createdAt", "nickname", "key"]),
          },
          numSharing: 0,
        })),
      ];
    },
    invites: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      return Invite.findAll({ where: { fromId: user.id, status: "pending" } });
    },
  },
  Mutation: {
    unsubscribeFromWaitlist: async (_parent, { id }) => {
      const entry = await WaitlistEntry.findOne({
        where: { id, unsubscribedAt: null },
      });
      if (!entry) return false;

      await entry.unsubscribe();
      await slackPulse(`${entry.email} unsubscribed from the waitlist`);
      return true;
    },
    joinWaitlist: async (_parent, { email, firstName }) => {
      return withinTransaction(async (transaction) => {
        const entry = await WaitlistEntry.findOne({
          where: { email },
          transaction,
        });
        if (!entry) {
          const newEntry = await WaitlistEntry.create(
            { email, firstName },
            { transaction }
          );

          verifyWaitlistEmailQueue.add(
            { email: newEntry.email },
            { attempts: 5, backoff: 5000 }
          );

          await slackPulse(`${email} joined the waitlist`);

          return WaitlistStatusGraphql.Unverified;
        }

        entry.firstName = firstName;
        if (entry.unsubscribedAt) {
          entry.unsubscribedAt = null;
          await slackPulse(`${entry.email} resubscribed to the waitlist`);
        }
        await entry.save({ transaction });

        if (!entry.emailConfirmed) return WaitlistStatusGraphql.Unverified;

        switch (entry.status) {
          case WaitlistStatus.Waiting:
            return WaitlistStatusGraphql.Waiting;
          case WaitlistStatus.Invited:
            return WaitlistStatusGraphql.Invited;
          case WaitlistStatus.Accepted:
            return WaitlistStatusGraphql.Accepted;
          default:
            return assertNever();
        }
      });
    },
    confirmWaitlist: async (_parent, { secret }, ctx) => {
      return await withinTransaction(async (transaction) => {
        const entry = await WaitlistEntry.findOne({
          where: { verifyEmailSecret: secret },
          transaction,
        });

        if (!entry) {
          ctx.error("NotFound/EmailVerification");
          return assertNever();
        }

        entry.emailConfirmed = true;
        await entry.save({ transaction });

        await slackPulse(
          `${entry.email} confirmed their email for the beta waitlist`
        );

        switch (entry.status) {
          case WaitlistStatus.Waiting:
            return WaitlistStatusGraphql.Waiting;
          case WaitlistStatus.Invited:
            return WaitlistStatusGraphql.Invited;
          case WaitlistStatus.Accepted:
            return WaitlistStatusGraphql.Accepted;
          default:
            return assertNever();
        }
      });
    },
    verifyEmail: async (_parent, { id }, ctx) => {
      return withinTransaction(async (transaction) => {
        const verification: EmailVerification | null = await EmailVerification.findOne(
          {
            where: { id },
            include: [{ model: User, required: true }],
            transaction,
            // Use a blocking update lock to avoid concurrent updates
            lock: transaction.LOCK.UPDATE,
          }
        );

        if (!verification) {
          ctx.error("NotFound/EmailVerification");
          return assertNever();
        }

        verification.user.emailVerified = true;
        await verification.user.save({ transaction });
        await verification.destroy({ transaction });

        return true;
        // If the transaction is serializable, `findOne` will throw an error in the case
        // where someone opens the verify email link in multiple tabs at roughly the same time
      }, Transaction.ISOLATION_LEVELS.READ_COMMITTED);
    },
    deleteInvite: async (_parent, { id }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      return withinTransaction(async (transaction) => {
        const invite = await Invite.findOne({
          where: { id, fromId: user.id, status: InviteStatus.Pending },
          transaction,
        });

        if (!invite) {
          ctx.error("NotFound/Login");
          return false;
        }

        // This should cascade to associated LoginAccess and InviteLoginAccess
        await invite.destroy({ transaction });

        await slackPulse(
          `${user.email} deleted their invite for ${invite.nickname}`
        );

        return true;
      });
    },
    createInvite: async (_parent, { params }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const email = params.email?.trim();
      const invite = await Invite.create({ fromId: user.id, ...params, email });
      await slackPulse(
        `${user.email} created a new invite link for their friend ${params.nickname}`
      );
      return invite.id;
    },
    updateInvite: async (_parent, { id, changes }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      return await withinTransaction(async (transaction) => {
        const invite = await Invite.findOne({
          where: { id, fromId: user.id, toId: null },
          transaction,
        });

        if (!invite) throw new Error("Couldn't find invite?");

        await invite.update(changes, { transaction });

        return true;
      });
    },
    dismissOnboardingCard: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      await user.update({ showOnboardingCard: false });
      return true;
    },
    requestLoginShare: async (_parent, { id }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const access = await LoginAccess.findOne({
        where: { userId: user.id, loginDataId: id, status: "preview" },
        include: [LoginData],
      });
      if (!access) throw new Error("Not found");
      await access.update({ status: "request/pending" });
      friendNotificationEmailQueue.add({
        name: "login_access_requested",
        fromId: user.id,
        toId: access.loginData.userId,
      });
      return true;
    },
    approveShareRequest: async (
      _parent,
      {
        params: { id, memberId, credentialsKey },
      }: { params: ApproveShareRequestInput },
      ctx
    ) => {
      const { user } = requireVerifiedUser(ctx.req);
      const login = await Login.findOne({
        where: { id, managerId: user.id, memberId, status: "request/pending" },
      });
      if (!login) throw new Error("Not found");

      await LoginAccess.update(
        {
          status: "shared",
          credentialsKey,
        },
        { where: { loginDataId: id, userId: memberId } }
      );

      return true;
    },
    rejectShareRequest: async (_parent, { id, memberId }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const login = await Login.findOne({
        where: { id, managerId: user.id, memberId, status: "request/pending" },
      });
      if (!login) throw new Error("Not found");
      await LoginAccess.update(
        {
          status: "request/denied",
        },
        { where: { loginDataId: id, userId: memberId } }
      );

      return true;
    },
    publishLoginPreviews: async (
      _parent,
      { params: { friendId, loginPreviewKeys } },
      ctx
    ) => {
      const { user } = requireVerifiedUser(ctx.req);

      const newLoginCount = await withinTransaction(async (transaction) => {
        if (!(await user.hasRelationshipWith(friendId)))
          throw new Error("Not friends?");
        const loginCount = await LoginData.count({
          where: { id: _.map(loginPreviewKeys, "loginId"), userId: user.id },
          transaction,
        });
        if (loginCount !== loginPreviewKeys.length)
          throw new Error("Couldn't find all logins?");

        const records = loginPreviewKeys.map(({ loginId, previewKey }) => ({
          loginDataId: loginId,
          previewKey,
          userId: friendId,
          status: "preview",
        }));

        // For some reason, LoginAccess.bulkCreate generates invalide SQL for this. Probably some bug with composite keys.
        await Promise.all(
          records.map((record) => LoginAccess.create(record, { transaction }))
        );

        return loginCount;
      });

      friendNotificationEmailQueue.add({
        name: "new_login_previews",
        fromId: user.id,
        toId: friendId,
        data: { newLoginCount },
      });

      return true;
    },
    publishLoginPreviewsForInvite: async (
      _parent,
      { params: { inviteId, loginPreviewKeys } },
      ctx
    ) => {
      const { user } = requireVerifiedUser(ctx.req);

      await withinTransaction(async (transaction) => {
        const invite = await Invite.findOne({
          where: { fromId: user.id, id: inviteId },
          transaction,
        });
        if (!invite) throw new Error("No invite?");

        const loginCount = await LoginData.count({
          where: { id: _.map(loginPreviewKeys, "loginId"), userId: user.id },
          transaction,
        });
        if (loginCount !== loginPreviewKeys.length)
          throw new Error("Couldn't find all logins?");

        const records = loginPreviewKeys.map(({ loginId, previewKey }) => ({
          loginDataId: loginId,
          previewKey,
          inviteId,
          status: "preview",
        }));

        // For some reason, InviteLoginAccess.bulkCreate generates invalide SQL for this. Probably some bug with composite keys.
        await Promise.all(
          records.map((record) =>
            InviteLoginAccess.create(record, { transaction })
          )
        );

        return loginCount;
      });

      return true;
    },
    shareLogin: async (_parent, { params }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      await withinTransaction(async (transaction) => {
        const friendship = await Friend.findOne({
          where: { userId: user.id, friendId: params.friendId },
          include: [
            {
              model: User,
              as: "friend",
              include: [
                {
                  model: Invite,
                  as: "invite",
                  where: { fromId: user.id },
                  required: false, // Adding WHERE clause defaults include to INNER JOIN but we need LEFT
                },
              ],
            },
          ],
          transaction,
        });
        if (!friendship) throw new Error("Not friends?");

        const login = await Login.findOne({
          where: { id: params.loginId, managerId: user.id, status: "manager" },
          include: ["loginData"],
          transaction,
        });
        if (!login) throw new Error("Login not found?");

        if (friendship.friend.invite) {
          await InviteLoginAccess.destroy({
            where: {
              inviteId: friendship.friend.invite!.id,
              loginDataId: login.loginData.id,
            },
            transaction,
          });
        }

        await user.offerLoginToFriend(
          login.loginData,
          friendship.friend,
          _.pick(params, ["previewKey", "credentialsKey"]),
          { transaction }
        );
      });

      return true;
    },
    preshareLogin: async (_parent, { params }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const invite = await Invite.findOne({
        where: {
          fromId: user.id,
          toId: null,
          status: "pending",
          id: params.inviteId,
        },
      });
      if (!invite) throw new Error("Not friends?");

      const login = await Login.findOne({
        where: { id: params.loginId, managerId: user.id, status: "manager" },
      });
      if (!login) throw new Error("Login not found?");

      try {
        await InviteLoginAccess.upsert({
          loginDataId: login.id,
          inviteId: params.inviteId,
          credentialsKey: params.credentialsKey,
          previewKey: params.previewKey,
          status: "offer/pending",
        });
      } catch (error) {
        console.error(error);
      }

      await slackPulse(
        `${user.email} pre-shared a login with their friend ${invite.nickname}`
      );

      return true;
    },
    createLogin: async (_parent, { params }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      const loginId = await withinTransaction(async (transaction) => {
        const loginData = await LoginData.createWithAccess(
          {
            user: user,
            ..._.pick(params, ["credentials", "preview"]),
            ..._.pick(params, ["credentialsKey", "previewKey"]),
            sharePreviews: params.sharePreviews,
            schemaVersion: params.schemaVersion,
            type: params.type,
          },
          { transaction }
        );

        const [friendCount, inviteCount] = await Promise.all([
          Friend.count({
            where: {
              userId: user.id,
              friendId: { [Op.in]: params.friendShares.map((f) => f.id) },
            },
            transaction,
          }),
          Invite.count({
            where: {
              fromId: user.id,
              status: "pending",
              id: { [Op.in]: params.inviteShares.map((f) => f.id) },
            },
            transaction,
          }),
        ]);

        if (friendCount > 0) {
          await slackPulse(
            `${user.email} shared a login with ${friendCount} friend${
              friendCount > 1 ? "s" : ""
            }`
          );
        }

        if (inviteCount > 0) {
          await slackPulse(
            `${user.email} pre-shared a login with ${inviteCount} friend${
              inviteCount > 1 ? "s" : ""
            }`
          );
        }

        if (
          friendCount !== params.friendShares.length ||
          inviteCount !== params.inviteShares.length
        )
          throw new Error("Mismatch");

        await Promise.all(
          params.friendShares.map(async (friendShare) => {
            const friend = await User.findByPk(friendShare.id, { transaction });
            if (!friend) throw new Error("Couldnt find friend?");

            return user.offerLoginToFriend(
              loginData,
              friend,
              _.pick(friendShare, ["previewKey", "credentialsKey"]),
              { transaction }
            );
          })
        );

        await Promise.all(
          params.inviteShares.map((inviteShare) =>
            InviteLoginAccess.create(
              {
                loginDataId: loginData.id,
                previewKey: inviteShare.previewKey,
                credentialsKey: inviteShare.credentialsKey,
                inviteId: inviteShare.id,
                status: "offer/pending",
              },
              { transaction }
            )
          )
        );

        return loginData.id;
      });

      const login = await Login.findOne({
        where: { id: loginId, managerId: user.id },
      });
      if (!login) throw new Error("What");
      return login;
    },
    deleteLogin: async (_parent, { id }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      return withinTransaction(async (transaction) => {
        const loginData = await LoginData.findOne({
          where: { id, userId: user.id },
          transaction,
        });

        if (!loginData) {
          ctx.error("NotFound/Login");
          return false;
        }

        // This should cascade to associated LoginAccess and InviteLoginAccess
        await loginData.destroy({ transaction });

        await slackPulse(`${user.email} deleted a login`);

        return true;
      });
    },
    updateLogin: async (_parent, { params }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      return await withinTransaction(async (transaction) => {
        const login = await LoginData.findOne({
          where: { id: params.id, userId: user.id },
          transaction,
        });

        if (!login) throw new Error("Not found");

        await login.update(
          {
            credentials: params.credentials,
            preview: params.preview,
            sharePreviews: params.sharePreviews,
            schemaVersion: params.schemaVersion,
          },
          { transaction }
        );

        if (!params.sharePreviews) {
          LoginAccess.destroy({
            where: {
              loginDataId: login.id,
              status: ["preview", "request/pending", "request/denied"],
            },
            transaction,
          });
        }

        await slackPulse(`${user.email} updated a login`);

        await LoginAccess.destroy({
          where: {
            loginDataId: params.id,
            status: { [Op.or]: ["shared", "offer/pending"] },
            userId: params.revokedFriendShares,
          },
          transaction,
        });

        await InviteLoginAccess.destroy({
          where: {
            loginDataId: params.id,
            status: "offer/pending",
            inviteId: params.revokedInviteShares,
          },
          transaction,
        });

        await shareLoginWithFriends(
          user,
          login,
          params.newFriendShares,
          transaction
        );

        await shareLoginWithInvitedFriends(
          user,
          login,
          params.newInviteShares,
          transaction
        );

        return true;
      });
    },
    recordMagicLinkUsage: async (_parent, { id, state }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);
      const login = await Login.findOne({
        where: { id, memberId: user.id },
        include: ["manager"],
      });

      switch (state) {
        case "activating":
          await slackPulse(
            `${user.email} activated a magic link (${id}), shared by their friend ${login?.manager.email}`
          );
          break;
        case "success":
          await slackPulse(
            `${user.email} says their magic link (${id}) activation worked!`
          );
          break;
        case "fail":
          await slackPulse(
            `${user.email} says their magic link (${id}) activation didn't work.`
          );
          break;
        default:
          return assertNever();
      }

      return true;
    },
    acceptLoginShare: async (_parent, { loginId }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      const login = await Login.findOne({
        where: { id: loginId, memberId: user.id, status: "offer/pending" },
      });
      if (!login) throw new Error("Couldn't find share");

      const access = await login.getLoginAccess();
      await access.update({ status: "shared" });

      await slackPulse(`${user.email} accepted a login share`);

      return true;
    },
    rejectLoginShare: async (_parent, { id }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      const share = await LoginAccess.findOne({
        where: {
          loginDataId: id,
          userId: user.id,
          status: "offer/pending",
        },
      });
      if (!share) throw new Error("Couldn't find share");

      await share.update({ status: "offer/rejected" });

      await slackPulse(`${user.email} rejected a login share`);

      return true;
    },
    addFriend: async (_parent, { userId }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      if (userId === user.id) throw new Error("Can't befriend yourself");

      const recipient = await User.findByPk(userId);
      if (!recipient) throw new Error("Could not find a user with that id");

      await FriendRequest.destroy({
        where: { recipientId: user.id, initiatorId: userId },
      });

      await FriendRequest.create({
        initiatorId: user.id,
        recipientId: recipient.id,
      });

      await friendNotificationEmailQueue.add({
        name: "friend_request",
        fromId: user.id,
        toId: recipient.id,
      });

      await slackPulse(
        `${user.email} sent a friend request to ${recipient.email}`
      );

      return true;
    },
    acceptFriendRequest: async (_parent, { id }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      const friendReq = await withinTransaction(async (transaction) => {
        const friendReq = await FriendRequest.findOne({
          where: { id, recipientId: user.id, status: "pending" },
          include: ["initiator"],
          transaction,
        });
        if (!friendReq) throw new Error("Can't find matching friend request");

        await friendReq.accept({ transaction });

        await Friend.create(
          {
            friendRequestId: friendReq.id,
            userId: user.id,
            friendId: friendReq.initiatorId,
          },
          { transaction }
        );

        await Friend.create(
          {
            friendRequestId: friendReq.id,
            userId: friendReq.initiatorId,
            friendId: user.id,
          },
          { transaction }
        );

        await slackPulse(
          `${user.email} accepted a friend request from ${friendReq.initiator.email}`
        );

        return friendReq;
      });

      await friendNotificationEmailQueue.add({
        name: "friend_request_accepted",
        toId: friendReq.initiator.id,
        fromId: user.id,
      });

      return true;
    },
    rejectFriendRequest: async (
      _parent,
      { requestId }: { requestId: string },
      ctx
    ) => {
      const { user } = requireVerifiedUser(ctx.req);

      const friendReq = await FriendRequest.findOne({
        where: { recipientId: user.id, id: requestId, status: "pending" },
        include: ["initiator"],
      });
      if (!friendReq) throw new Error("Can't find matching friend request");

      await friendReq.reject({});

      await slackPulse(
        `${user.email} rejected a friend request from ${friendReq.initiator.email}`
      );

      return true;
    },

    unfriend: async (_parent, { id }: { id: string }, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      const other = await User.findByPk(id);
      if (!other) throw new Error("Couldn't find other user");
      const friendship = await user.friendshipWith(other);

      await friendship.destroy();

      return true;
    },
    acceptInvite: async (
      _parent,
      { params }: { params: AcceptInviteInput },
      ctx: { error: RequestErrorFn }
    ) => {
      const { user, invite } = await withinTransaction(async (transaction) => {
        const invite = await Invite.findOne({
          where: { id: params.id, status: "pending" },
          include: ["from"],
          transaction,
        });
        if (!invite) {
          ctx.error("NotFound/Invite");
          return assertNever();
        }
        if (!params.user.avatarUrl) delete params.user["avatarUrl"];
        const user = await User.create({ ...params.user }, { transaction });
        await slackPulse(
          `${user.email} accepted an invite from ${invite.from.email}`
        );

        await invite.update(
          { toId: user.id, status: "accepted" },
          { transaction }
        );

        if (invite.autofriend) {
          const friendReq = await FriendRequest.create(
            {
              initiatorId: invite.fromId,
              recipientId: user.id,
              status: "accepted",
            },
            { transaction }
          );

          await Friend.create(
            {
              friendRequestId: friendReq.id,
              userId: friendReq.initiatorId,
              friendId: friendReq.recipientId,
            },
            { transaction }
          );

          await Friend.create(
            {
              friendRequestId: friendReq.id,
              userId: friendReq.recipientId,
              friendId: friendReq.initiatorId,
            },
            { transaction }
          );
        }

        if (params.accessKeys.length > 0) {
          const preshareCount = await InviteLoginAccess.count({
            where: {
              inviteId: params.id,
              loginDataId: {
                [Op.in]: params.accessKeys.map((item) => item.id),
              },
            },
            transaction,
          });
          if (preshareCount !== params.accessKeys.length)
            throw new Error(
              `Mismatch in access key transfer for accept invite. Expected ${preshareCount}, got ${params.accessKeys.length} keys`
            );

          await Promise.all(
            params.accessKeys.map(async (item) => {
              const loginData = await LoginData.findByPk(item.id, {
                transaction,
              });
              if (!loginData) throw new Error("Couldn't find loginData??");

              if (item.credentialsKey) {
                return loginData.offerAccessTo(
                  user,
                  {
                    previewKey: item.previewKey,
                    credentialsKey: item.credentialsKey,
                  },
                  { transaction }
                );
              } else {
                return loginData.grantPreviewTo(
                  user,
                  { previewKey: item.previewKey },
                  { transaction }
                );
              }
            })
          );

          await slackPulse(
            `${invite.from.email} shared ${params.accessKeys.length} login${
              params.accessKeys.length > 1 ? "s" : ""
            } with ${user.email}`
          );

          await InviteLoginAccess.destroy({
            where: {
              inviteId: params.id,
              loginDataId: {
                [Op.in]: params.accessKeys.map((item) => item.id),
              },
            },
            transaction,
          });
        }

        return { user, invite };
      });

      await user.enqueueVerificationEmail();

      if (invite.autofriend) {
        await friendNotificationEmailQueue.add({
          name: "invite_accepted",
          toId: invite.fromId,
          fromId: user.id,
          data: {
            inviteNickname: invite.nickname,
          },
        });
      }

      return user;
    },
    acceptBetaInvite: async (
      _parent,
      { params }: { params: AcceptBetaInviteInput },
      ctx: { error: RequestErrorFn },
      info
    ) => {
      return withinTransaction(async (transaction) => {
        const waitlistEntry = await WaitlistEntry.findInvite(params.id, {
          transaction,
        });

        if (!waitlistEntry) {
          ctx.error("NotFound/Invite");
          return assertNever();
        }

        if (!params.user.avatarUrl) delete params.user["avatarUrl"];
        const user = await User.create(
          {
            ...params.user,
            email: waitlistEntry.email,
            emailVerified: true,
            isInBetaOnboarding: true,
          },
          { transaction }
        );

        await slackPulse(`${user.email} joined the beta`);

        await waitlistEntry.update({ status: "accepted" }, { transaction });

        return user;
      });
    },
    updateAccount: async (_parent, params, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      if (!params.avatarUrl) delete params["avatarUrl"];
      if (!params.username) delete params["username"];

      if (_.isEmpty(params)) return false;

      await user.update(params);

      return true;
    },
    updatePassword: async (_parent, { params }, ctx) => {
      const { user, srpHandshake } = requireVerifiedUser(ctx.req);
      if (!user.forcedPasswordChangeEnabled) {
        ctx.error("Unauthorized");
        return assertNever();
      }
      await user.update(params);
      await SRPHandshake.destroy({
        where: { userId: user.id, id: { [Op.not]: srpHandshake.id } },
      });
      return true;
    },
    createUser: async (
      _parent,
      { params }: { params: CreateUserInput },
      ctx: { error: RequestErrorFn }
    ) => {
      if (env.INVITE_ONLY) {
        ctx.error("Unauthorized");
        return assertNever();
      }
      if (!params.avatarUrl) delete params["avatarUrl"];
      const user = await User.create({ ...params });
      await user.enqueueVerificationEmail();
      await slackPulse(`${user.email} created an account`);
      return user;
    },
    finishBetaOnboarding: async (_parent, _args, ctx) => {
      const { user } = requireVerifiedUser(ctx.req);

      // Verify conditions for finishing onboarding

      if (!user.isInBetaOnboarding) throw new Error("Not in onboarding?");

      const invites = await withinTransaction(async (transaction) => {
        const [loginCount, invites] = await Promise.all([
          LoginData.count({ where: { userId: user.id }, transaction }),
          Invite.findAll({
            where: { fromId: user.id, toId: null, email: { [Op.not]: null } },
            include: [{ model: InviteLoginAccess, required: true }], // INNER JOIN invite_login_access so that we enforce login access being shared
            transaction,
          }),
        ]);

        if (loginCount === 0) throw new Error("Need at least one login");

        await user.update({ isInBetaOnboarding: false }, { transaction });

        await slackPulse(`${user.email} finished the beta onboarding`);

        return invites;
      });

      await Promise.all(
        invites.map((invite) =>
          friendInviteEmailQueue.add({
            fromId: user.id,
            inviteId: invite.id,
          })
        )
      );

      return true;
    },
    startSRPHandshake: async (
      _parent,
      {
        params,
      }: {
        params: StartSrpHandshakeInput;
      }
    ): Promise<SrpStartHandshakeResponse> => {
      const user = await User.findOne({ where: { email: params.email } });

      // We don't want to reveal which emails exist in the DB, so we return a fake
      // session response if a user isn't found
      if (!user) {
        return {
          id: uuidv4(),
          srpSalt: crypto.randomBytes(32).toString("hex"),
          srpPbkdf2Salt: crypto.randomBytes(32).toString("hex"),
          serverPublicEphemeral: crypto.randomBytes(256).toString("hex"),
        };
      }

      const ephemeral = srp.generateEphemeral(user.srpVerifier);

      // Delete any other active but incomplete handshakes
      await SRPHandshake.destroy({
        where: { userId: user.id, sessionKey: null },
      });

      const srpHandshake = await SRPHandshake.create({
        userId: user.id,
        clientPublic: params.clientPublicEphemeral,
        serverSecret: ephemeral.secret,
        sessionWrapper: crypto.randomBytes(32).toString("base64"),
      });

      return {
        id: srpHandshake.id,
        srpSalt: user.srpSalt,
        srpPbkdf2Salt: user.srpPbkdf2Salt,
        serverPublicEphemeral: ephemeral.public,
      };
    },
    finishSRPHandshake: async (
      _parent,
      {
        params,
      }: {
        params: FinishSrpHandshakeInput;
      },
      ctx: { res: ExpressRes; error: RequestErrorFn }
    ) => {
      const handshake = await SRPHandshake.findOne({
        where: { id: params.id },
        include: [{ model: User }],
      });

      if (!handshake) ctx.error("AuthenticationFailed");

      let serverSession;
      try {
        serverSession = srp.deriveSession(
          handshake.serverSecret,
          handshake.clientPublic,
          handshake.user.srpSalt,
          handshake.user.email.toLowerCase(),
          handshake.user.srpVerifier,
          params.clientProof
        );
      } catch (error) {
        ctx.error("AuthenticationFailed");
      }

      handshake.sessionKey = serverSession.key;
      handshake.save();

      // TODO: Verify the serverSession? What happens when given bad data?

      return {
        id: handshake.id,
        serverProof: serverSession.proof,
        sessionWrapper: handshake.sessionWrapper,
        masterKeyPbkdf2Salt: handshake.user.masterKeyPbkdf2Salt,
      };
    },
    signOut: async (_parent, _args, ctx) => {
      const { srpHandshake } = requireVerifiedUser(ctx.req);
      await srpHandshake.destroy();
      return true;
    },
  },
  Friend: FriendResolver,
  Invite: InviteResolver,
  MyLogin: MyLoginResolver,
  SharedLogin: SharedLoginResolver,
  PendingOutboundFriendRequest: PendingOutboundFriendRequestResolver,
  ShareRecipient: {
    __resolveType(obj, ctx) {
      return "publicKey" in obj ? "Friend" : "Invite";
    },
  },
};

export interface GraphQLContext {
  req: AuthProcessedRequest;
  res: ExpressRes;
  error: RequestErrorFn;
}

const adminRouter = Express.Router();
adminRouter.use("/queue", BullBoardUI);
app.use(
  `/${env.adminPath}`,
  basicAuth({
    users: { [env.adminUsername]: env.adminPassword },
    challenge: true,
  }),
  adminRouter
);

app.use(
  "/graphql",
  // @ts-expect-error res is definitely an Express response type, but graphqlHTTP doesn't specify that in their types
  graphqlHTTP((req: IncomingMessage, res: ExpressRes) => {
    const auth = getAuth(req as AuthProcessedRequest);

    try {
      console.info(
        `[GraphQL] [${req.ip}] ${
          auth.authenticated ? `[${auth.user.email}]` : "(Guest)"
        }`,
        _.get(req, "body.query")
      );
    } catch (error) {
      console.error("Error while trying to log GraphQL", error);
    }

    return {
      extensions: ({ result }: { result: { errors?: GraphQLError[] } }) => {
        if (!result.errors) return;

        return {
          handledError: result.errors.every(
            (value) => value.originalError instanceof AppReqError
          ),
        };
      },

      schema: makeExecutableSchema({
        typeDefs,
        resolvers: resolvers as GraphQLResolvers.IResolvers,
      }),
      rootValue: auth.authenticated ? auth.user : null,
      pretty: env.isDevelopment(),
      graphiql: env.NODE_ENV !== "production",
      customFormatErrorFn: (err) => {
        addToBugsnagMetadata({
          graphql: {
            path: err.path?.join("/"),
            source: err.source?.body,
            name: err.name,
          },
        });
        // Errors thrown inside of resolvers aren't caught by Bugsnag!
        env.bugsnag.notify(err.originalError || err);

        logGraphqlError(err);
        if (env.isProd()) {
          if (err.originalError instanceof AppReqError) {
            return err.originalError.message;
          } else {
            return "UnexpectedError";
          }
        } else {
          return err;
        }
      },
      context: { req, res, error: requestError },
    };
  })
);

app.get("/extensions/chrome", (req, res, next) => {
  res.status(307);
  res.header("Location", env.chromeExtensionUrl());

  res.end();
});

/**
 * New setup: during heroku postbuild, copy the react-app compilation into backend/public
 */

const publicAssets = path.resolve(__dirname, "../public");
const landingPage = path.resolve(publicAssets, "landing", "index.html");
const appBundle = path.resolve(publicAssets, "app.html");

app.use(bugsnagMiddleware.errorHandler);

app.get("/", async function (req, res) {
  // If a valid SRP cookie is set, that means the user is logged in
  // and we need to serve the bundle. Otherwise, we need to serve the
  // static landing page which is separate from the bundle
  if (await isSrpCookieValid(req.signedCookies.srpHandshakeId)) {
    res.sendFile(appBundle);
  } else {
    res.clearCookie("srpHandshakeId");
    res.sendFile(landingPage);
  }
});

app.use(express.static(publicAssets));

// All remaining requests return the React app, so it can handle routing.
app.get("*", function (req, res) {
  res.sendFile(appBundle);
});

export default app;
