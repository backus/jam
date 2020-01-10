"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users DROP COLUMN vault_metadata;
    ALTER TABLE users DROP COLUMN vault_metadata_last_updated_at;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users ADD COLUMN vault_metadata t_aes_encrypted_blob NOT NULL;
    ALTER TABLE users ADD COLUMN vault_metadata_last_updated_at timestamp without time zone DEFAULT now() NOT NULL;

    COMMIT;
    `);
  },
};
