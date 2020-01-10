"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    TRUNCATE TABLE users CASCADE; 
    ALTER TABLE users ALTER COLUMN pbkdf2_salt SET NOT NULL;
    ALTER TABLE users RENAME COLUMN pbkdf2_salt TO srp_pbkdf2_salt;
    ALTER TABLE users ADD COLUMN master_key_pbkdf2_salt t_srp_salt NOT NULL;

    COMMIT;`);
  },

  down: async (queryInterface, _) => {
    throw new Error("No going back lol");
  },
};
