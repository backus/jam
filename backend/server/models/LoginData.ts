import * as Sequelize from "sequelize-typescript";
import { User } from ".";
import LoginAccess from "./LoginAccess";

import { AesEncryptedBlob, RsaEncryptedBlob } from "./types";
import { Transactionable } from "sequelize/types";
import { slackPulse } from "../pulse";
import { LoginSchemaVersion, LoginType } from "../resolvers";

@Sequelize.Table({ tableName: "login_data", underscored: true })
export default class LoginData extends Sequelize.Model<LoginData> {
  @Sequelize.IsUUID(4)
  @Sequelize.PrimaryKey
  @Sequelize.Column({ autoIncrement: true })
  id: string;

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
  userId: string;

  @Sequelize.BelongsTo(() => User)
  user: User;

  @Sequelize.HasMany(() => LoginAccess, {
    scope: { status: "shared" },
    as: "sharedAccess",
  })
  sharedAccess: LoginAccess[];

  @Sequelize.HasOne(() => LoginAccess, {
    scope: { status: "manager" },
    as: "managerAccess",
  })
  managerAccess: LoginAccess;

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

  static async createWithAccess(
    {
      user,
      credentials,
      preview,
      credentialsKey,
      previewKey,
      sharePreviews,
      schemaVersion,
      type,
    }: {
      user: User;
      credentials: AesEncryptedBlob;
      preview: AesEncryptedBlob;
      credentialsKey: RsaEncryptedBlob;
      previewKey: RsaEncryptedBlob;
      sharePreviews: boolean;
      schemaVersion: LoginSchemaVersion;
      type: LoginType;
    },
    dbOptions: Transactionable
  ) {
    const loginData = await this.create(
      {
        credentials,
        preview,
        userId: user.id,
        schemaVersion,
        type,
        sharePreviews,
        managerAccess: {
          credentialsKey,
          previewKey,
          userId: user.id,
          status: "manager",
        },
      },
      { include: ["managerAccess"], ...dbOptions }
    );

    await slackPulse(
      `${user.email} added a new login to Jam with preview sharing ${
        sharePreviews ? "enabled" : "disabled"
      }`
    );

    return loginData;
  }

  async grantPreviewTo(
    friend: User,
    keys: {
      previewKey: RsaEncryptedBlob;
    },
    dbOptions: Transactionable
  ) {
    return LoginAccess.upsert(
      {
        loginDataId: this.id,
        userId: friend.id,
        ...keys,
        status: "preview",
      },
      dbOptions
    );
  }

  async offerAccessTo(
    friend: User,
    keys: {
      credentialsKey: RsaEncryptedBlob;
      previewKey: RsaEncryptedBlob;
    },
    dbOptions: Transactionable
  ) {
    return LoginAccess.upsert(
      {
        loginDataId: this.id,
        userId: friend.id,
        ...keys,
        status: "offer/pending",
      },
      dbOptions
    );
  }
}
