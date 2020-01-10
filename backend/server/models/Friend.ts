import * as Sequelize from "sequelize-typescript";
import { User, FriendRequest } from "./";
import { AesEncryptedBlob, RsaEncryptedBlob } from "./types";

export enum FriendRequestStatus {
  Pending = "pending",
  Accepted = "accepted",
  Rejected = "rejected",
}

@Sequelize.Table({ tableName: "friends", underscored: true })
export default class Friend extends Sequelize.Model<Friend> {
  @Sequelize.PrimaryKey
  @Sequelize.ForeignKey(() => User)
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  userId: string;

  @Sequelize.BelongsTo(() => User, "userId")
  user: User;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  friendId: string;

  @Sequelize.BelongsTo(() => User, "friendId")
  friend: User;

  @Sequelize.ForeignKey(() => FriendRequest)
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  friendRequestId: string;

  @Sequelize.BelongsTo(() => FriendRequest)
  friendRequest: FriendRequest;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;
}
