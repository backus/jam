import Queue from "bull";
import env from "./env";
import { User } from "./models";
const { setQueues } = require("bull-board");

export const verifyEmailQueue = new Queue<{ userId: string }>(
  "verify-email",
  env.redisUrl
);

export const verifyWaitlistEmailQueue = new Queue<{ email: string }>(
  "verify-waitlist-email",
  env.redisUrl
);

// Catch all for emails involving an action performed by one user affecting another
export const friendNotificationEmailQueue = new Queue<{
  name: string;
  toId: string;
  fromId: string;
  data?: object;
}>("friend-notification-email", env.redisUrl);

export const friendInviteEmailQueue = new Queue<{
  inviteId: string;
  fromId: string;
}>("friend-invite-email", env.redisUrl);

export const betaInviteEmailQueue = new Queue<{
  waitlistEntryId: string;
}>("beta-invite-email", env.redisUrl);

export const betaInviteScheduler = new Queue<{}>(
  "beta-invite-scheduler",
  env.redisUrl
);

export const slackNotificationQueue = new Queue<{
  message: string;
}>("slack-notification", env.redisUrl);

setQueues([
  verifyEmailQueue,
  verifyWaitlistEmailQueue,
  friendNotificationEmailQueue,
  friendInviteEmailQueue,
  betaInviteEmailQueue,
  betaInviteScheduler,
  slackNotificationQueue,
]);
