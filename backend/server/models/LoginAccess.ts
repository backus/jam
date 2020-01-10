import * as Sequelize from "sequelize-typescript";
import User from "./User";
import Login from "./Login";
import LoginData from "./LoginData";

import { AesEncryptedBlob, RsaEncryptedBlob } from "./types";
import { Op } from "sequelize";

export enum LoginAccessStatus {
  Manager = "manager",
  Preview = "preview",
  Shared = "shared",
  OfferPending = "offer/pending",
  OfferRejected = "offer/rejected",
  RequestPending = "request/pending",
  RequestDenied = "request/denied",
}

@Sequelize.Scopes(() => ({
  shared: {
    where: { status: LoginAccessStatus.Shared },
  },
  manager: {
    where: { status: LoginAccessStatus.Manager },
  },
}))
@Sequelize.Table({ tableName: "login_access", underscored: true })
export default class LoginAccess extends Sequelize.Model<LoginAccess> {
  @Sequelize.IsUUID(4)
  /**
   * NOTE: Important that PrimaryKey is set for both loginDataId and userId.
   * These two columns are the composite primary key of the table. If only one
   * is marked as a primary key, it breaks updates, uniqueness constraints, and other things
   */
  @Sequelize.PrimaryKey
  @Sequelize.ForeignKey(() => LoginData)
  @Sequelize.ForeignKey(() => Login)
  @Sequelize.Column({ autoIncrement: true, unique: "login_access_pkey" })
  loginDataId: string;

  @Sequelize.BelongsTo(() => LoginData)
  loginData: LoginData;

  @Sequelize.BelongsTo(() => Login, "loginDataId")
  login: Login;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;

  @Sequelize.IsUUID(4)
  @Sequelize.PrimaryKey
  @Sequelize.ForeignKey(() => User)
  @Sequelize.NotNull
  @Sequelize.Column({ allowNull: false, unique: "login_access_pkey" })
  userId: string;

  @Sequelize.BelongsTo(() => User)
  user: User;

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
}
