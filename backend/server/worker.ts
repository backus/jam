/* eslint-disable import/first */
process.env.APP_MODE = "worker";

import {
  User,
  Invite,
  WaitlistEntry,
  sequelize,
  withinTransaction,
} from "./models";

import {
  verifyEmailQueue,
  verifyWaitlistEmailQueue,
  friendNotificationEmailQueue,
  friendInviteEmailQueue,
  betaInviteEmailQueue,
  betaInviteScheduler,
  slackNotificationQueue,
} from "./queue";
import {
  friendNotificationEmail,
  friendInviteEmail,
  betaInviteEmail,
  waitlistVerificationEmail,
} from "./emails";
import env from "./env";
import { slackWebhook, slackPulse } from "./pulse";
import chalk from "chalk";

const maxJobsPerWorker = 1;

verifyEmailQueue.process(maxJobsPerWorker, async (job) => {
  const user = await User.findOne({ where: { id: job.data.userId } });
  if (!user) throw new Error("Couldn't find user");

  await user.sendVerificationEmail();
  return Promise.resolve();
});

verifyWaitlistEmailQueue.process(maxJobsPerWorker, async (job) => {
  await withinTransaction(async (transaction) => {
    const entry = await WaitlistEntry.findOne({
      where: { email: job.data.email, emailConfirmed: false },
      transaction,
    });
    if (!entry) throw new Error("Couldn't find waitlist entry!");

    await waitlistVerificationEmail(entry);

    await entry.update({ verifyEmailSentAt: new Date() }, { transaction });
  });

  console.info(`[waitlist verify email] Sent to ${job.data.email}`);
  return Promise.resolve();
});

friendNotificationEmailQueue.process(maxJobsPerWorker, async (job) => {
  const to = await User.findOne({ where: { id: job.data.toId } });
  if (!to) throw new Error("Couldn't find user");
  const from = await User.findOne({ where: { id: job.data.fromId } });
  if (!from) throw new Error("Couldn't find user");

  const data = job.data.data || {};

  try {
    await friendNotificationEmail(job.data.name, {
      to,
      from,
      data,
    });
  } catch (error) {
    env.bugsnag.notify(error);
    console.error("Failed to send email!", error);
    throw error;
  }

  console.info(
    `[friend email] Sent ${job.data.name} from ${from.id} to ${to.id}`
  );
  return Promise.resolve();
});

friendInviteEmailQueue.process(maxJobsPerWorker, async (job) => {
  const invite = await Invite.findEmailInvite(job.data.inviteId);
  if (!invite) throw new Error("Couldn't find invite");
  const from = await User.findOne({ where: { id: job.data.fromId } });
  if (!from) throw new Error("Couldn't find user");

  try {
    await friendInviteEmail(invite, from);
  } catch (error) {
    env.bugsnag.notify(error);
    console.error("Failed to send email!", error);
    throw error;
  }

  console.info(`[invite email] Sent invite from ${from.id} to ${invite.id}`);
  return Promise.resolve();
});

betaInviteEmailQueue.process(maxJobsPerWorker, async (job) => {
  await withinTransaction(async (transaction) => {
    const waitlistEntry = await WaitlistEntry.findAndLockUnsentInvite(
      job.data.waitlistEntryId,
      { transaction }
    );

    if (!waitlistEntry)
      throw new Error(
        `Couldn't find waitlist entry with id ${job.data.waitlistEntryId}`
      );

    await waitlistEntry.markEmailSent({ transaction });
    try {
      await betaInviteEmail(waitlistEntry);
    } catch (error) {
      env.bugsnag.notify(error);
      console.error("Failed to send email!", error);
      throw error;
    }

    await slackPulse(`Beta invite sent to ${waitlistEntry.email}`);

    console.info(`[beta invite email] Sent invite to ${waitlistEntry.id}`);
  });

  return Promise.resolve();
});

betaInviteScheduler.process(async (job) => {
  const entries = await WaitlistEntry.inviteRandomPool(
    env.betaInvites.batchSize
  );

  for (let i = 0; i < entries.length; i++) {
    await betaInviteEmailQueue.add({ waitlistEntryId: entries[i].id });
  }
});

slackNotificationQueue.process(maxJobsPerWorker, async (job) => {
  if (env.isProd()) {
    await slackWebhook.send({ text: job.data.message });
  } else {
    console.info(chalk.bold(`${chalk.yellow("[#pulse]")} ${job.data.message}`));
  }

  return Promise.resolve();
});

const scheduleDailyBetaInvites = async () => {
  if (env.appMode !== "worker") {
    console.log("Not worker. Skipping...");
    return;
  }

  const delayed = await betaInviteScheduler.getDelayed();
  if (
    delayed.length === 1 &&
    (delayed[0]!.opts?.repeat as any)?.cron === env.betaInvites.cronSchedule
  ) {
    console.info(
      "A matching cron schedule already exists. Leaving it alone..."
    );
    return;
  }

  if (delayed.length >= 1) {
    console.info("Clearing daily beta invite schedule");
    await betaInviteScheduler.empty();
  }

  console.info("Adding an entry to the cron schedule");
  await betaInviteScheduler.add(
    {},
    { repeat: { cron: env.betaInvites.cronSchedule } }
  );
};

scheduleDailyBetaInvites()
  .then(() => console.log("Successfully scheduled daily beta invites"))
  .catch((reason) => console.error("Failed while scheduling invites", reason));
