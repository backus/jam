import { IncomingWebhook } from "@slack/webhook";
import env from "./env";
import { slackNotificationQueue } from "./queue";

export const slackWebhook = new IncomingWebhook(env.slackPulseWebhookUrl, {
  icon_emoji: ":heartbeat:",
});

export const slackPulse = (message: string) =>
  slackNotificationQueue.add({ message });
