"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE invites ADD COLUMN autofriend boolean DEFAULT true NOT NULL;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE invites DROP COLUMN autofriend;

    COMMIT;
    `);
  },
};
