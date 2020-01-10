import * as Sequelize from "sequelize-typescript";
import { Transactionable } from "sequelize";
import { QueryTypes, Op, literal, fn } from "sequelize";
import { sequelize } from ".";

const emailPattern = /.+@.+\..+/;

export enum WaitlistStatus {
  Waiting = "waiting",
  Invited = "invited",
  Accepted = "accepted",
}

@Sequelize.Table({ tableName: "waitlist_entries", underscored: true })
export default class WaitlistEntry extends Sequelize.Model<WaitlistEntry> {
  @Sequelize.PrimaryKey
  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    allowNull: false,
    validate: { is: emailPattern },
    unique: true,
  })
  email: string;

  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false, autoIncrement: true })
  id: string;

  @Sequelize.IsUUID(4)
  @Sequelize.Column({ allowNull: false, defaultValue: literal("DEFAULT") })
  verifyEmailSecret: string;

  @Sequelize.Column({ type: Sequelize.DataType.DATE })
  verifyEmailSentAt: Date;

  @Sequelize.CreatedAt createdAt: Date;
  @Sequelize.UpdatedAt updatedAt: Date;

  @Sequelize.Column({ type: Sequelize.DataType.DATE })
  unsubscribedAt: Date | null;

  @Sequelize.Column({
    type: Sequelize.DataType.STRING,
    defaultValue: WaitlistStatus.Waiting,
    allowNull: false,
  })
  status: WaitlistStatus;

  @Sequelize.Column({ type: Sequelize.DataType.DATE })
  emailSentAt: Date;

  @Sequelize.Column({
    type: Sequelize.DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  emailConfirmed: boolean;

  @Sequelize.Column({ type: Sequelize.DataType.STRING, allowNull: false })
  firstName: string | null;

  static async inviteRandomPool(poolSize: number) {
    return sequelize.query<WaitlistEntry>(
      `
      UPDATE waitlist_entries
      SET status = 'invited'
      WHERE id in (
        SELECT id
        FROM waitlist_entries
        WHERE status = 'waiting'
        AND unsubscribed_at IS NULL
        ORDER BY random()
        LIMIT :poolSize
      ) returning *
    `,
      {
        replacements: { poolSize },
        type: QueryTypes.SELECT,
        mapToModel: true,
        model: WaitlistEntry,
      }
    );
  }

  static async findInvite(id: string, options?: Transactionable) {
    return this.findOne({
      where: { id, status: "invited", emailSentAt: { [Op.not]: null } },
      ...options,
    });
  }

  static async findAndLockUnsentInvite(
    id: string,
    { transaction }: Transactionable
  ) {
    const entry = ((await sequelize.query<WaitlistEntry>(
      `SELECT * FROM waitlist_entries
      WHERE id = :id AND status = 'invited' AND email_sent_at IS NULL
      FOR UPDATE NOWAIT`,
      {
        plain: true,
        replacements: { id },
        type: QueryTypes.SELECT,
        mapToModel: true,
        model: WaitlistEntry,
        transaction,
      }
    )) as any) as WaitlistEntry | null; // setting `plain: true` means the result is a single item

    return entry;
  }

  async unsubscribe() {
    return this.update({ unsubscribedAt: fn("NOW") });
  }

  async markEmailSent(options: Transactionable) {
    return this.update({ emailSentAt: new Date() }, options);
  }

  betaInviteUri() {
    return `/beta/${this.id}`;
  }

  verifyEmailUri() {
    return `/waitlist/confirm/${this.verifyEmailSecret}`;
  }

  unsubscribeUri() {
    return `/waitlist/unsubscribe/${this.id}`;
  }
}
