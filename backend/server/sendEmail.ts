import mailgunJs from "mailgun-js";
import env from "./env";
import chalk from "chalk";

export interface IEmail {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (message: IEmail) => {
  const config = {
    apiKey: env.mailgunApiKey,
    domain: env.mailgunDomain,
  };
  const mailgun = mailgunJs(config);

  const subjectPrefix = env.isProd() ? "" : `[${env.NODE_ENV}] `;

  const to = env.isProd() ? message.to : "support+development@jam.link";

  if (env.isDevelopment()) {
    console.info(
      chalk.bold(
        `${chalk.greenBright("[#email]")} sending "${message.subject}" to ${to}`
      )
    );
  }

  const data = {
    from: message.from ? message.from : `Jam! <hi@${config.domain}>`,
    to,
    subject: subjectPrefix + message.subject,
    text: message.text,
    html: message.html,
  };

  return mailgun.messages().send(data, (error) => {
    if (error) {
      console.warn(`Mailgun send failure: ${JSON.stringify(error)}`, {
        level: "error",
      });
      if (error.message.indexOf("parameter is not a valid address") === -1) {
        throw error;
      }
    }
    return;
  });
};
