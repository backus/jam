import * as Sequelize from "sequelize-typescript";
import { User } from "./";
import { RsaEncryptedBlob } from "./types";
import InviteLoginAccess from "./InviteLoginAccess";
import { Op } from "sequelize";

export enum InviteStatus {
  Pending = "pending",
  Accepted = "accepted",
  Expired = "expired",
}

@Sequelize.Table({ tableName: "invites", underscored: true })
export default class Invite extends Sequelize.Model<Invite> {
  @Sequelize.PrimaryKey
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false, autoIncrement: true })
  id: string;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.NotNull
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  fromId: string;

  @Sequelize.BelongsTo(() => User, "fromId")
  from: User;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.IsUUID(4)
  @Sequelize.Column({})
  toId: string;

  @Sequelize.BelongsTo(() => User, "toId")
  to: User | null;

  @Sequelize.Column({ type: Sequelize.DataType.STRING })
  phone: string | null;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    validate: { is: /.+@.+\..+/ },
  })
  email: string | null;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    defaultValue: InviteStatus.Pending,
  })
  status: InviteStatus;

  @Sequelize.Column({
    type: Sequelize.DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  autofriend: boolean;

  @Sequelize.Column({
    type: Sequelize.DataType.JSON,
    allowNull: false,
  })
  key: RsaEncryptedBlob;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: {
      len: [1, 15],
    },
  })
  nickname: string;

  @Sequelize.HasMany(() => InviteLoginAccess, "inviteId")
  loginAccessList: InviteLoginAccess[];

  static async findEmailInvite(id: string) {
    return this.findOne({ where: { id, email: { [Op.not]: null } } });
  }

  uri() {
    return `/invite/${this.id}`;
  }
}
