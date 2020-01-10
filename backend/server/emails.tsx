import * as React from "react";
import { User, EmailVerification, Invite, WaitlistEntry } from "./models";
import { sendEmail } from "./sendEmail";
import * as path from "path";
import * as fs from "fs";
import globAsync from "glob";
import { promisify } from "util";
import * as _ from "lodash";
import env from "./env";
import { formatDistanceToNow } from "date-fns";
const sanitize = require("xss");
const mjml2html = require("mjml");
const glob = promisify(globAsync);

const emailsDir = path.resolve(env.projectRoot(), "emails");
let templates: { [key: string]: string } = {};

glob(path.resolve(emailsDir, "*.mjml")).then((files) => {
  if (files.length === 0)
    throw new Error(`Couldn't find any email templates in ${emailsDir}!`);

  files.forEach((file) =>
    fs.readFile(file, (_err, data) => {
      const key = path.basename(file).replace(/\.mjml$/, "");
      const { html: compiled } = mjml2html(data.toString());
      templates[key] = compiled;
    })
  );
});

const compileEmail = (name: string) => (locals: { [key: string]: string }) => {
  let email = templates[name];
  if (!email) throw new Error(`No template defined for ${name}!`);

  const matches = [...email.matchAll(/{{(?<name>[\w_]+)}}/g)];
  matches.forEach(([template_name, key]) => {
    const value = locals[key];
    if (!_.isString(value)) throw new Error(`Expected locals to define ${key}`);

    email = email.replace(new RegExp(template_name, "g"), sanitize(value));
  });

  return email;
};

export const verifyEmailHtml = compileEmail("verify_email");

export const sendVerifyEmail = (
  user: User,
  emailVerification: EmailVerification
) => {
  return sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Hey ${
      user.username
    }, welcome to Jam!\n\nPlease visit this link to verify your email: ${emailVerification.url()}`,
    html: verifyEmailHtml({
      username: user.username,
      verify_url: emailVerification.url(),
    }),
  });
};

export const friendNotificationEmail = (
  name: string,
  { to, from, data }: { to: User; from: User; data: { [key: string]: any } }
) => {
  switch (name) {
    case "invite_accepted":
      if (!data.inviteNickname)
        throw new Error("Expected nickname from invite to be provided!");
      return sendEmail({
        to: to.email,
        subject: `💕 ${data.inviteNickname} accepted your invite!`,
        text: `Your friend ${
          data.inviteNickname
        } accepted your invite! Their username is @${
          from.username
        }. Share something with them on Jam: ${env.appUrl("/")}`,
        html: compileEmail(name)({
          from_username: from.username,
          from_avatar_url: from.avatarAbsoluteUrl(),
          invite_nickname: data.inviteNickname,
          email_header_url: env.appUrl("email-header.png"),
          app_url: env.appUrl("/"),
        }),
      });
    case "login_access_requested":
      return sendEmail({
        to: to.email,
        subject: `🙋 ${from.username} has a question`,
        text: `@${
          from.username
        } requested access to one of your accounts. You don't have to say yes, but I bet it would make them happy if you did: ${env.appUrl(
          "/notifications"
        )}`,
        html: compileEmail(name)({
          from_username: from.username,
          from_avatar_url: from.avatarAbsoluteUrl(),
          email_header_url: env.appUrl("email-header.png"),
          notifications_url: env.appUrl("/notifications"),
        }),
      });
    case "login_request_approved":
      return sendEmail({
        to: to.email,
        subject: `🎉 ${from.username} shared a login`,
        text: `@${
          from.username
        } just gave you access to a login you asked them to share. Check it out on Jam: ${env.appUrl(
          "/"
        )}`,
        html: compileEmail(name)({
          from_username: from.username,
          from_avatar_url: from.avatarAbsoluteUrl(),
          share_account_icon_url: env.appUrl("account-share-email-icon.png"),
          email_header_url: env.appUrl("email-header.png"),
          notifications_url: env.appUrl("/notifications"),
        }),
      });
    case "new_login_previews":
      if (!("newLoginCount" in data))
        throw new Error("Expected login count to be defined");

      const newLoginCount = data.newLoginCount as number;
      const desc =
        newLoginCount === 1 ? "a new login" : `${newLoginCount} new logins`;
      return sendEmail({
        to: to.email,
        subject: `👀 @${from.username} added ${desc} to Jam!`,
        text: `@${
          from.username
        } added ${desc} new logins to Jam. You can request access here: ${env.appUrl(
          "/"
        )}`,
        html: compileEmail(name)({
          app_url: env.appUrl("/"),
          email_header_url: env.appUrl("email-header.png"),
          from_avatar_url: from.avatarAbsoluteUrl(),
          from_username: from.username,
          logins_desc: desc,
        }),
      });
    case "friend_request_accepted":
      return sendEmail({
        to: to.email,
        subject: `💕 New friend`,
        text: `@${
          from.username
        } accepted your friend request! Share something with them on Jam: ${env.appUrl(
          "/"
        )}`,
        html: compileEmail(name)({
          host: env.domain.toString(),
          friend_username: from.username,
          friend_avatar_url: from.avatarAbsoluteUrl(),
          email_header_url: env.appUrl("email-header.png"),
          app_url: env.appUrl("/"),
        }),
      });
    case "share_login":
      return sendEmail({
        to: to.email,
        subject: `🎁 @${from.username} shared a login!`,
        text: `${
          from.username
        } just shared a new login with you. How exciting! Find out what it is: ${env.appUrl(
          "notifications"
        )}`,
        html: compileEmail(name)({
          host: env.domain.toString(),
          sender_username: from.username,
          sender_avatar_url: from.avatarAbsoluteUrl(),
          email_header_url: env.appUrl("email-header.png"),
          share_account_icon_url: env.appUrl("account-share-email-icon.png"),
          notifications_url: env.appUrl("notifications"),
        }),
      });
    case "friend_request":
      return sendEmail({
        to: to.email,
        subject: `😍 New friend request`,
        text: `${
          from.username
        } wants to be your friend. Visit this link to respond: ${env.appUrl(
          "notifications"
        )}`,
        html: compileEmail(name)({
          host: env.domain.toString(),
          sender_username: from.username,
          sender_avatar_url: from.avatarAbsoluteUrl(),
          email_header_url: env.appUrl("email-header.png"),
          notifications_url: env.appUrl("notifications"),
        }),
      });
    default:
      throw new Error(
        `Not sure what to do with email notification type ${name}`
      );
  }
};

export const friendInviteEmail = (invite: Invite, from: User) => {
  if (!invite.email) throw new Error("This invite doesn't have an emamil!");

  const inviteUrl = env.appUrl(invite.uri());

  return sendEmail({
    to: invite.email,
    subject: `🎁 ${from.username} shared a login with you!`,
    text:
      `@${from.username} just shared a login with you using Jam! ` +
      `Jam is a new service for securely sharing passwords with friends. ` +
      `Go here to find out what they gave you: ${inviteUrl}`,
    html: compileEmail("friend_invite")({
      email_header_url: env.appUrl("email-header.png"),
      from_username: from.username,
      from_avatar_url: from.avatarAbsoluteUrl(),
      share_account_icon_url: env.appUrl("account-share-email-icon.png"),
      invite_url: inviteUrl,
    }),
  });
};

export const betaInviteEmail = (waitlistEntry: WaitlistEntry) => {
  const inviteUrl = env.appUrl(waitlistEntry.betaInviteUri());
  const unsubscribeUrl = env.appUrl(waitlistEntry.unsubscribeUri());

  const greeting = waitlistEntry.firstName
    ? `Hi ${waitlistEntry.firstName}!`
    : "Hi!";

  const timeSinceWaitlist = formatDistanceToNow(waitlistEntry.createdAt);

  return sendEmail({
    from: "Jam <support@jam.link>",
    to: waitlistEntry.email,
    subject: `Jam beta invite`,
    text: [
      `${greeting} I'm reaching out to share your Jam invite with you: ${inviteUrl}`,
      "",
      `You joined Jam's waiting list ${timeSinceWaitlist} ago, so, in case you forgot, Jam is a new service for sharing accounts with friends.`,
      "",
      "Anyways, Jam is very new, so I'm thrilled you took an early interest. If you have any feedback, you can reach me at this email.",
      "",
      "Thanks,",
      "John",
      "",
      `P.S. If you definitely didn't add your email to the waiting list, you can unsubscribe here: ${unsubscribeUrl}`,
    ].join("\n"),
    html: compileEmail("beta_invite")({
      beta_invite_url: inviteUrl,
      greeting,
      time_since_waitlist: timeSinceWaitlist,
      unsubscribe_url: unsubscribeUrl,
    }),
  });
};

export const waitlistVerificationEmail = (entry: WaitlistEntry) => {
  const verificationUrl = env.appUrl(entry.verifyEmailUri());

  return sendEmail({
    to: entry.email,
    subject: "Confirm your email",
    text: `Hi ${
      entry.firstName || "there"
    }. Click this link to confirm your email and join the Jam waiting list: ${verificationUrl}`,
    html: compileEmail("verify_waitlist_email")({
      email_header_url: env.appUrl("email-header.png"),
      first_name: entry.firstName || "there",
      verification_url: verificationUrl,
    }),
  });
};
