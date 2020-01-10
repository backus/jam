"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER DOMAIN t_username ADD CONSTRAINT username_length CHECK (char_length(VALUE) <= 15);
    
    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER DOMAIN t_international_e164_number SET NOT NULL;
    
    ALTER DOMAIN t_username DROP CONSTRAINT username_length;

    COMMIT;
    `);
  },
};
