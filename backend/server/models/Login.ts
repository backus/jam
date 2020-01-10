import * as Sequelize from "sequelize-typescript";
import { User, LoginAccess, InviteLoginAccess, LoginData, sequelize } from ".";

import { AesEncryptedBlob, RsaEncryptedBlob } from "./types";
import { LoginAccessStatus } from "./LoginAccess";
import { map } from "lodash";
import * as _ from "lodash";
import { Op, QueryTypes, Transactionable, col, literal } from "sequelize";
import { LoginShareRequest, LoginSchemaVersion, LoginType } from "../resolvers";
import Friend from "./Friend";

@Sequelize.Table({ tableName: "logins", underscored: true })
export default class Login extends Sequelize.Model<Login> {
  @Sequelize.IsUUID(4)
  @Sequelize.PrimaryKey
  @Sequelize.Column({ autoIncrement: true })
  id: string;

  @Sequelize.BelongsTo(() => LoginData, "id")
  loginData: LoginData;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;

  @Sequelize.Column({
    type: Sequelize.DataType.JSON,
    allowNull: false,
  })
  preview: AesEncryptedBlob;

  @Sequelize.Column({
    type: Sequelize.DataType.JSON,
    allowNull: false,
  })
  credentials: AesEncryptedBlob;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.NotNull
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  managerId: string;

  @Sequelize.BelongsTo(() => User, "managerId")
  manager: User;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.NotNull
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  memberId: string;

  @Sequelize.BelongsTo(() => User, "memberId")
  member: User;

  @Sequelize.Column({
    type: Sequelize.DataType.JSON,
    allowNull: false,
  })
  previewKey: RsaEncryptedBlob;

  @Sequelize.Column({ type: Sequelize.DataType.JSON })
  credentialsKey: RsaEncryptedBlob;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    defaultValue: LoginAccessStatus.Preview,
  })
  status: LoginAccessStatus;

  @Sequelize.HasMany(() => LoginAccess)
  loginAccessList: LoginAccess[];

  @Sequelize.Column({
    type: Sequelize.DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  sharePreviews: boolean;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
  })
  schemaVersion: LoginSchemaVersion;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
  })
  type: LoginType;

  @Sequelize.BelongsToMany(() => User, () => LoginAccess)
  static async pendingRequestsFor(managerId: string) {
    return sequelize.query<LoginShareRequest>(
      `SELECT
        logins.id,
        logins.preview,
        logins.preview_key AS "previewKey",
        logins.credentials_key AS "credentialsKey",
        logins.schema_version AS "schemaVersion",
        logins.type,
        users.id AS "member.id",
        users.email AS "member.email",
        users.username AS "member.username",
        users.public_key AS "member.publicKey",
        users.avatar_url AS "member.avatarUrl"
      FROM logins
      JOIN login_access ON login_data_id = logins.id
      JOIN users ON login_access.user_id = users.id
      WHERE
        manager_id = :managerId
        AND logins.status = 'manager'
        AND login_access.user_id <> :managerId
        AND login_access.status = 'request/pending'
        ;
      `,
      {
        replacements: { managerId },
        type: QueryTypes.SELECT,
        nest: true,
        raw: true,
      }
    );
  }

  static async loginPreviewTodoForFriend({
    loginOwner,
    friend,
  }: {
    loginOwner: User;
    friend: { id: string };
  }): Promise<Login[]> {
    return sequelize.query<Login>(
      `
      SELECT
        logins.*
      FROM logins
      LEFT JOIN login_access
        ON login_access.login_data_id = logins.id
        AND login_access.user_id = :friend_id
      WHERE logins.manager_id = :manager_id
        AND logins.member_id = :manager_id
        AND logins.share_previews = 't'
        AND login_access.login_data_id IS NULL;
    `,
      {
        replacements: { manager_id: loginOwner.id, friend_id: friend.id },
        type: QueryTypes.SELECT,
        mapToModel: true,
        model: Login,
      }
    );
  }

  static async loginPreviewTodoForInvite({
    loginOwner,
    inviteId,
  }: {
    loginOwner: User;
    inviteId: string;
  }): Promise<Login[]> {
    return sequelize.query<Login>(
      `
      SELECT
        logins.*
      FROM logins
      LEFT JOIN invite_login_access
        ON invite_login_access.login_data_id = logins.id
        AND invite_login_access.invite_id = :invite_id
      WHERE logins.manager_id = :manager_id
        AND logins.member_id = :manager_id
        AND logins.share_previews = 't'
        AND invite_login_access.login_data_id IS NULL;
    `,
      {
        replacements: { manager_id: loginOwner.id, invite_id: inviteId },
        type: QueryTypes.SELECT,
        mapToModel: true,
        model: Login,
      }
    );
  }

  /**
   * Fetch all relevant login previews for a user. Filter out login previews
   * where the users are not friends yet. Those records correspond to previews
   * published during a friend request that has not yet been accepted
   *
   * @param userId user id of login access member
   */
  static async previewsFor(userId: string) {
    return this.findAll({
      where: {
        memberId: userId,
        status: { [Op.in]: ["preview", "request/pending", "request/denied"] },
      },
      include: [
        {
          model: User,
          as: "manager",
          required: true,
          include: [
            // Perform `JOIN friends ON user_id = manager.id AND friend_id = :userId`
            // to enforce that we only return login previews where the member is
            // friends with the manager.
            {
              model: Friend,
              as: "friends",
              required: true,
              where: {
                friendId: userId,
              },
              attributes: [], // We don't actually need the data
            },
          ],
        },
      ],
    });
  }

  static async sharedWithFriend({
    userId,
    friendId,
  }: {
    userId: string;
    friendId: string;
  }) {
    const sharedLogins = await Login.findAll({
      where: {
        managerId: userId,
        memberId: friendId,
        status: "shared",
      },
      attributes: ["id"],
      raw: true,
    });

    return Login.findAll({
      where: {
        managerId: userId,
        memberId: userId,
        status: "manager",
        id: _.map(sharedLogins, "id"),
      },
    });
  }

  static async sharedWithUser({
    userId,
    friendId,
  }: {
    userId: string;
    friendId: string;
  }) {
    return Login.findAll({
      where: {
        managerId: friendId,
        memberId: userId,
        status: "shared",
      },
    });
  }

  static async previewsSharedWithFriend({
    userId,
    friendId,
  }: {
    userId: string;
    friendId: string;
  }) {
    const sharedPreviews = await Login.findAll({
      where: {
        managerId: userId,
        memberId: friendId,
        status: "preview",
      },
      attributes: ["id"],
      raw: true,
    });

    return Login.findAll({
      where: {
        managerId: userId,
        memberId: userId,
        status: "manager",
        id: _.map(sharedPreviews, "id"),
      },
    });
  }

  static async previewsSharedWithUser({
    userId,
    friendId,
  }: {
    userId: string;
    friendId: string;
  }) {
    return Login.findAll({
      where: {
        managerId: friendId,
        memberId: userId,
        status: "preview",
      },
    });
  }

  async getLoginAccess() {
    const access = await LoginAccess.findOne({
      where: { loginDataId: this.id, userId: this.memberId },
    });
    if (!access)
      throw new Error(
        "There should definitely be a corresponding LoginAccess model..."
      );
    return access;
  }

  async userIdsSharingWith() {
    const accessList = await LoginAccess.findAll({
      where: { loginDataId: this.id, status: { [Op.not]: "preview" } },
      attributes: ["userId"],
      raw: true,
    });

    return map(accessList, "userId");
  }

  async inviteIdsSharingWith() {
    const accessList = await InviteLoginAccess.findAll({
      where: { loginDataId: this.id, status: { [Op.not]: "preview" } },
      attributes: ["inviteId"],
      raw: true,
    });

    return map(accessList, "inviteId");
  }

  toSummary() {
    return {
      ..._.pick(this, [
        "id",
        "createdAt",
        "preview",
        "previewKey",
        "manager",
        "schemaVersion",
        "type",
      ]),
      accessRequested:
        this.status === "request/pending" || this.status === "request/denied",
    };
  }
}
