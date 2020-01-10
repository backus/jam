import * as Sequelize from "sequelize-typescript";
import { Op } from "sequelize";
import { User } from ".";

const byteStringPattern = (size: number) => new RegExp(`^[\\da-f]{${size}}$`);

@Sequelize.Scopes(() => ({
  complete: {
    where: { sessionKey: { [Op.not]: null } },
  },
}))
@Sequelize.Table({ tableName: "srp_handshakes", underscored: true })
export default class SRPHandshake extends Sequelize.Model<SRPHandshake> {
  @Sequelize.IsUUID(4)
  @Sequelize.PrimaryKey
  @Sequelize.Column({ autoIncrement: true })
  id: string;

  @Sequelize.CreatedAt createdAt: Date;

  @Sequelize.UpdatedAt updatedAt: Date;

  @Sequelize.ForeignKey(() => User)
  @Sequelize.NotNull
  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false })
  userId: string;

  @Sequelize.BelongsTo(() => User)
  user: User;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: { is: byteStringPattern(64) },
  })
  serverSecret: string;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: { is: byteStringPattern(512) },
  })
  clientPublic: string;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    validate: { is: byteStringPattern(64) },
  })
  sessionKey: string | null;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
  })
  sessionWrapper: string;

  isComplete(): this is SRPHandshake & { sessionKey: string } {
    return this.sessionKey !== null;
  }
}
