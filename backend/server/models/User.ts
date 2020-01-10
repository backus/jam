import * as Sequelize from "sequelize-typescript";
import { literal, Transactionable } from "sequelize";
import { QueryTypes, Op, NOW } from "sequelize";
import { AesEncryptedBlob, RsaEncryptedBlob } from "./types";
import {
  sequelize,
  FriendRequest,
  EmailVerification,
  Login,
  LoginAccess,
  LoginData,
  Invite,
  Friend,
} from ".";
import { FriendRequestStatus } from "./FriendRequest";
import { toInt } from "../utils";
import * as _ from "lodash";
import { sendVerifyEmail } from "../emails";
import { verifyEmailQueue, friendNotificationEmailQueue } from "../queue";
import env from "../env";
import SRPHandshake from "./SRPHandshake";
import { FindFriendResult, Friend as GraphqlFriend } from "../resolvers";
import { slackPulse } from "../pulse";

const emailPattern = /.+@.+\..+/;
const byteStringPattern = (size: number) => new RegExp(`^[\\da-f]{${size}}$`);

@Sequelize.Table({ tableName: "users", underscored: true })
export default class User extends Sequelize.Model<User> {
  @Sequelize.IsUUID(4)
  @Sequelize.PrimaryKey
  @Sequelize.Column({ autoIncrement: true })
  id: string;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: { is: emailPattern },
    unique: true,
  })
  email: string;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: {
      is: [/^[a-zA-Z0-9 _]+$/, /^[a-zA-Z0-9]/, /[a-zA-Z0-9]$/],
      len: [2, 15],
    },
  })
  username: string;

  @Sequelize.HasOne(() => SRPHandshake)
  srpHandshake: SRPHandshake;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: { is: byteStringPattern(64) },
    unique: true,
  })
  srpSalt: string;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: { is: byteStringPattern(64) },
    unique: true,
  })
  srpPbkdf2Salt: string;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: { is: byteStringPattern(64) },
    unique: true,
  })
  masterKeyPbkdf2Salt: string;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: { is: byteStringPattern(512) },
    unique: true,
  })
  srpVerifier: string;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    unique: true,
  })
  publicKey: string;

  @Sequelize.Column({
    type: Sequelize.DataType.JSON,
    allowNull: false,
    unique: true,
  })
  encryptedPrivateKey: AesEncryptedBlob;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;

  @Sequelize.Column({
    type: Sequelize.DataType.DATE,
    allowNull: false,
    defaultValue: NOW,
  })
  lastActiveAt: Date;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    defaultValue: "/img/no-avatar.png",
  })
  avatarUrl: string;

  @Sequelize.Column({
    type: Sequelize.DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  showOnboardingCard: boolean;

  @Sequelize.Column({
    type: Sequelize.DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isInBetaOnboarding: boolean;

  @Sequelize.Column({
    type: Sequelize.DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  emailVerified: boolean;

  @Sequelize.Column({
    type: Sequelize.DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  forcedPasswordChangeEnabled: boolean;

  @Sequelize.HasMany(() => Login, "managerId")
  ownedLogins: Login[];

  @Sequelize.BelongsToMany(() => Login, () => LoginAccess)
  sharedLogins: Login[];

  // Invite that this user received in order to create their account
  @Sequelize.HasOne(() => Invite, "toId")
  invite?: Invite;

  @Sequelize.HasMany(() => Friend, "userId")
  friends: Friend[];

  // Update lastActiveAt, don't updated updatedAt so that the two timestamps don't just mean the same thing
  async touch() {
    return this.update({ lastActiveAt: new Date() }, { silent: true });
  }

  avatarAbsoluteUrl() {
    if (this.avatarUrl[0] === "/") {
      return env.appUrl(this.avatarUrl);
    } else {
      return this.avatarUrl;
    }
  }

  async enqueueVerificationEmail() {
    return verifyEmailQueue.add(
      { userId: this.id },
      { attempts: 5, backoff: 5000 }
    );
  }

  async sendVerificationEmail() {
    await EmailVerification.destroy({ where: { userId: this.id } });
    const verification = await EmailVerification.create({ userId: this.id });

    // Don't send this email in dev since Mailgun doesn't let us
    if (env.NODE_ENV === "development") return;

    return sendVerifyEmail(this, verification);
  }

  /**
   * Is this user either (1) friends with, or (2) waiting to hear back on
   * a friend request from the other user
   */
  async hasRelationshipWith(otherUserId: string): Promise<boolean> {
    const result = ((await sequelize.query<{ has_relationship: boolean }>(
      `
      SELECT
        SUM(relationships.has_relationship) IS NOT NULL AS has_relationship
      FROM (
        SELECT 1 AS has_relationship
        FROM friend_requests
        WHERE initiator_id = :user_id
          AND recipient_id = :friend_id
          AND status = 'pending'
      UNION SELECT 1 AS has_relationship
        FROM friends
        WHERE user_id = :user_id
          AND friend_id = :friend_id
      ) relationships;
    `,
      {
        replacements: { user_id: this.id, friend_id: otherUserId },
        type: QueryTypes.SELECT,
        raw: true,
        plain: true,
      }
    )) as any) as { has_relationship: boolean };

    return result.has_relationship;
  }

  /**
   * Find FriendRequest instance where status="accepted" for another user
   * @param other User
   */
  async friendshipWith(other: User): Promise<FriendRequest> {
    const friend = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          {
            recipientId: this.id,
            initiatorId: other.id,
          },
          {
            recipientId: other.id,
            initiatorId: this.id,
          },
        ],
        status: FriendRequestStatus.Accepted,
      },
    });
    if (!friend) throw new Error("Failed to find friendship");
    return friend;
  }

  async pendingInboundFriendRequests(): Promise<User[]> {
    return sequelize.query(
      `SELECT senders.*
      FROM friend_requests
      JOIN users AS senders ON initiator_id = senders.id
      WHERE
        recipient_id = :id
        AND status = 'pending'`,
      {
        replacements: { id: this.id },
        type: QueryTypes.SELECT,
        mapToModel: true,
        model: User,
      }
    );
  }

  async pendingOutboundFriendRequests(): Promise<FriendRequest[]> {
    return FriendRequest.findAll({
      where: { initiatorId: this.id, status: "pending" },
      include: ["recipient"],
    });
  }

  async searchStrangers(query: string): Promise<FindFriendResult[]> {
    return sequelize.query(
      `SELECT
        users.id AS "user.id",
        users.username AS "user.username",
        users.public_key AS "user.publicKey",
        users.avatar_url AS "user.avatarUrl",
        users.created_at AS "user.createdAt",
        CASE
          WHEN outbound_requests.id IS NOT NULL AND outbound_requests.status <> 'accepted' THEN 'outbound_pending'
          WHEN outbound_requests.id IS NOT NULL AND outbound_requests.status = 'accepted' THEN 'friend'
          WHEN inbound_requests.id IS NOT NULL AND inbound_requests.status = 'pending' THEN 'inbound_pending'
          WHEN inbound_requests.id IS NOT NULL AND inbound_requests.status = 'accepted' THEN 'friend'
          WHEN inbound_requests.id IS NOT NULL AND inbound_requests.status = 'rejected' THEN 'stranger'
          ELSE 'stranger' END AS status,
        inbound_requests.id AS "inboundFriendRequestId"
      FROM users
        LEFT JOIN friend_requests AS outbound_requests
          ON outbound_requests.initiator_id = :id
          AND outbound_requests.recipient_id = users.id
        LEFT JOIN friend_requests AS inbound_requests
          ON inbound_requests.recipient_id = :id
          AND inbound_requests.initiator_id = users.id
        WHERE users.id <> :id
        AND username ILIKE :query
        LIMIT 10;`,
      {
        replacements: { id: this.id, query: `${query}%` },
        type: QueryTypes.SELECT,
        nest: true,
        raw: true,
      }
    );
  }

  async sharingWithMeStats(): Promise<{ [key: string]: number }> {
    const result = await sequelize.query<{
      friendId: string;
      numSharing: string;
    }>(
      `
      SELECT
        manager_id AS "friendId",
        COUNT(*) as "numSharing"
      FROM logins
      WHERE member_id = :user_id
      AND status = 'shared'
      GROUP BY manager_id`,
      {
        replacements: { user_id: this.id },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );

    return _.fromPairs(
      result.map((row: { friendId: string; numSharing: string }) => [
        row.friendId,
        toInt(row.numSharing),
      ])
    );
  }

  async offerLoginToFriend(
    login: LoginData,
    friend: User,
    keys: {
      credentialsKey: RsaEncryptedBlob;
      previewKey: RsaEncryptedBlob;
    },
    dbOptions: Transactionable
  ) {
    const loginAccess = await login.offerAccessTo(friend, keys, dbOptions);

    await slackPulse(
      `${this.email} shared a login with their friend ${friend.email}`
    );

    await friendNotificationEmailQueue.add({
      name: "share_login",
      fromId: this.id,
      toId: friend.id,
    });

    return loginAccess;
  }
}
