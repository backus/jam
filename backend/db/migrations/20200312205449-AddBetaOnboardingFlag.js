"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users ADD COLUMN is_in_beta_onboarding boolean DEFAULT false NOT NULL;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users DROP COLUMN is_in_beta_onboarding;

    COMMIT;
    `);
  },
};
