"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER DOMAIN t_international_e164_number DROP NOT NULL;
    
    ALTER TABLE invites ALTER COLUMN phone DROP NOT NULL;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER DOMAIN t_international_e164_number SET NOT NULL;
    
    ALTER TABLE invites ALTER COLUMN phone SET NOT NULL;

    COMMIT;
    `);
  },
};
