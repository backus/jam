import * as Sequelize from "sequelize-typescript";
import { User } from "./";
import { AesEncryptedBlob, RsaEncryptedBlob } from "./types";
import { Transactionable } from "sequelize/types";

export enum FriendRequestStatus {
  Pending = "pending",
  Accepted = "accepted",
  Rejected = "rejected",
}

@Sequelize.Table({ tableName: "friend_requests", underscored: true })
export default class FriendRequest extends Sequelize.Model<FriendRequest> {
  @Sequelize.PrimaryKey
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false, autoIncrement: true })
  id: string;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.NotNull
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  initiatorId: string;

  @Sequelize.BelongsTo(() => User, "initiatorId")
  initiator: User;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.NotNull
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  recipientId: string;

  @Sequelize.BelongsTo(() => User, "recipientId")
  recipient: User;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    defaultValue: FriendRequestStatus.Pending,
  })
  status: FriendRequestStatus;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;

  async accept(updateOptions: Transactionable) {
    this.update(
      {
        status: FriendRequestStatus.Accepted,
      },
      updateOptions
    );
  }

  async reject(updateOptions: Transactionable) {
    this.update(
      {
        status: FriendRequestStatus.Rejected,
      },
      updateOptions
    );
  }
}
