"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
      BEGIN TRANSACTION;

      ALTER TABLE users ADD COLUMN forced_password_change_enabled boolean DEFAULT false NOT NULL;

      COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
      BEGIN TRANSACTION;

      ALTER TABLE users DROP COLUMN forced_password_change_enabled;

      COMMIT;
    `);
  },
};
