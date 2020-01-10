"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE waitlist_entries ADD COLUMN unsubscribed_at TIMESTAMP WITHOUT TIME ZONE;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE waitlist_entries DROP COLUMN unsubscribed_at;

    COMMIT;
    `);
  },
};
