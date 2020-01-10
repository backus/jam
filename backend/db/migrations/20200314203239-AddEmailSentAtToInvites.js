"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE waitlist_entries ADD COLUMN email_sent_at timestamp without time zone;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE waitlist_entries DROP COLUMN email_sent_at;

    COMMIT;
    `);
  },
};
