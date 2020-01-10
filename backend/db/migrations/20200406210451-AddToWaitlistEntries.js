"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(
      `
    BEGIN TRANSACTION;

    ALTER TABLE waitlist_entries
      ADD COLUMN email_confirmed boolean NOT NULL DEFAULT false;

    UPDATE waitlist_entries SET email_confirmed = 't';

    ALTER TABLE waitlist_entries
      ADD COLUMN first_name nonempty_string;

    ALTER TABLE waitlist_entries
      ADD COLUMN verify_email_secret uuid DEFAULT uuid_generate_v4() NOT NULL;

    ALTER TABLE waitlist_entries
      ADD COLUMN verify_email_sent_at timestamp without time zone;

    ALTER TABLE waitlist_entries
      ADD CONSTRAINT first_name_required CHECK (created_at < :migrationDate OR first_name IS NOT NULL);

    COMMIT;
    `,
      { replacements: { migrationDate: new Date().toUTCString() } }
    );
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE waitlist_entries DROP COLUMN first_name;
    ALTER TABLE waitlist_entries DROP COLUMN email_confirmed;
    ALTER TABLE waitlist_entries DROP COLUMN verify_email_secret;
    ALTER TABLE waitlist_entries DROP COLUMN verify_email_sent_at;

    COMMIT;
    `);
  },
};
