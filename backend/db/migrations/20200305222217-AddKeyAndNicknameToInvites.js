"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE DOMAIN nonempty_string AS varchar(15)
    CONSTRAINT not_blank CHECK (VALUE::text ~ '\\A[[:alnum:]][[:alnum:] ]+\\Z' AND length(trim(VALUE)) > 0);

    ALTER TABLE invites ADD COLUMN key t_rsa_encrypted_blob NOT NULL DEFAULT '{"ciphertext":"hack","algorithm":"RSA-OAEP"}'::json;
    ALTER TABLE invites ADD COLUMN nickname nonempty_string NOT NULL DEFAULT 'friend';
    ALTER TABLE invites ALTER COLUMN key DROP DEFAULT;
    ALTER TABLE invites ALTER COLUMN nickname DROP DEFAULT;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE invites DROP COLUMN nickname;
    ALTER TABLE invites DROP COLUMN key;
    DROP DOMAIN nonempty_string;

    COMMIT;
    `);
  },
};
