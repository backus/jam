import * as Sequelize from "sequelize-typescript";
import { User } from "./";
import env from "./../env";

@Sequelize.Table({ tableName: "email_verifications", underscored: true })
export default class EmailVerification extends Sequelize.Model<
  EmailVerification
> {
  @Sequelize.PrimaryKey
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false, autoIncrement: true })
  id: string;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.NotNull
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  userId: string;

  @Sequelize.BelongsTo(() => User, "userId")
  user: User;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;

  url() {
    return new URL(`/verify/${this.id}`, env.domain).toString();
  }
}
