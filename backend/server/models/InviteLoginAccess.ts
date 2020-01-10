import * as Sequelize from "sequelize-typescript";
import User from "./User";
import Login from "./Login";
import LoginData from "./LoginData";
import Invite from "./Invite";

import { AesEncryptedBlob, RsaEncryptedBlob } from "./types";
import { Op } from "sequelize";
import { LoginAccessStatus } from "./LoginAccess";

@Sequelize.Table({ tableName: "invite_login_access", underscored: true })
export default class InviteLoginAccess extends Sequelize.Model<
  InviteLoginAccess
> {
  @Sequelize.IsUUID(4)
  /**
   * NOTE: Important that PrimaryKey is set for both loginDataId and inviteId.
   * These two columns are the composite primary key of the table. If only one
   * is marked as a primary key, it breaks updates, uniqueness constraints, and other things
   */
  @Sequelize.PrimaryKey
  @Sequelize.ForeignKey(() => LoginData)
  @Sequelize.ForeignKey(() => Login)
  @Sequelize.Column({ autoIncrement: true, unique: "invite_login_access_pkey" })
  loginDataId: string;

  @Sequelize.BelongsTo(() => LoginData)
  loginData: LoginData;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;

  @Sequelize.IsUUID(4)
  @Sequelize.PrimaryKey
  @Sequelize.ForeignKey(() => Invite)
  @Sequelize.NotNull
  @Sequelize.Column({ allowNull: false, unique: "invite_login_access_pkey" })
  inviteId: string;

  @Sequelize.BelongsTo(() => Invite)
  invite: Invite;

  @Sequelize.Column({
    type: Sequelize.DataType.JSON,
    allowNull: false,
  })
  previewKey: AesEncryptedBlob;

  @Sequelize.Column({ type: Sequelize.DataType.JSON })
  credentialsKey: AesEncryptedBlob;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    defaultValue: LoginAccessStatus.Preview,
  })
  status: LoginAccessStatus;
}
