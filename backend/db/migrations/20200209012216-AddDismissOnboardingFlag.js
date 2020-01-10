"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users ADD COLUMN show_onboarding_card boolean DEFAULT true NOT NULL;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users DROP COLUMN show_onboarding_card;

    COMMIT;
    `);
  },
};
