import { Sequelize } from "sequelize-typescript";
import User from "./User";
import SRPHandshake from "./SRPHandshake";
import Login from "./Login";
import LoginAccess from "./LoginAccess";
import InviteLoginAccess from "./InviteLoginAccess";
import LoginData from "./LoginData";
import FriendRequest from "./FriendRequest";
import Friend from "./Friend";
import Invite from "./Invite";
import * as config from "./../../config/database";
import EmailVerification from "./EmailVerification";
import WaitlistEntry from "./WaitlistEntry";
import { Transaction } from "sequelize";
import chalk from "chalk";

const nodeEnv = (): "development" | "test" | "production" => {
  const env = process.env.NODE_ENV || "development";
  if (env !== "development" && env !== "test" && env !== "production")
    throw new Error("Invalid NODE_ENV");

  return env;
};

const nodeEnvironment = nodeEnv();

export const environmentConfig = config[nodeEnvironment];
let sequelize: Sequelize;

const opts =
  nodeEnvironment === "development"
    ? { logging: (msg: string) => console.log(chalk.dim(msg)) }
    : {
        logging: console.log,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      };

// Configure Sequelize using an environment variable or via JSON config depending on ENV
if (environmentConfig.use_env_variable) {
  const environmentUri = process.env[environmentConfig.use_env_variable];
  if (!environmentUri) {
    throw new Error(
      `Expected to find a database URI at ${environmentConfig.use_env_variable}`
    );
  }
  console.log("Booting DB using environment URI");
  // @ts-ignore
  sequelize = new Sequelize(environmentUri + "?sslmode=require", opts);
} else {
  console.log("Booting DB using env config");
  sequelize = new Sequelize({ ...(environmentConfig as any), ...opts });
}

// Register models with sequelize. We need to do this for all models in the project
sequelize.addModels([
  User,
  WaitlistEntry,
  SRPHandshake,
  Login,
  LoginAccess,
  InviteLoginAccess,
  LoginData,
  FriendRequest,
  Friend,
  Invite,
  EmailVerification,
]);

const withinTransaction = async <OperationReturnValue>(
  operation: (transaction: Transaction) => Promise<OperationReturnValue>,
  isolationLevel = Transaction.ISOLATION_LEVELS.SERIALIZABLE
): Promise<OperationReturnValue> => {
  return sequelize.transaction(
    {
      isolationLevel,
    },
    operation
  );
};

// Models should be imported from this file. Importing from the model file itself seems
// to require adding a `sequelize.addModels` call at the bottom of each source file.
// Easier to consolidate that here
export {
  User,
  SRPHandshake,
  Login,
  LoginAccess,
  InviteLoginAccess,
  LoginData,
  FriendRequest,
  Friend,
  Invite,
  EmailVerification,
  WaitlistEntry,
};

export { sequelize, withinTransaction };
