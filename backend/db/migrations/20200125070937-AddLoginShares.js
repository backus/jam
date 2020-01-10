"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE TABLE login_shares (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at timestamp without time zone DEFAULT now() NOT NULL,
      updated_at timestamp without time zone DEFAULT now() NOT NULL,
      login_id uuid NOT NULL REFERENCES logins(id),
      from_id uuid NOT NULL REFERENCES users(id),
      to_id uuid NOT NULL REFERENCES users(id),
      preview t_aes_encrypted_blob NOT NULL,
      credentials t_aes_encrypted_blob NOT NULL
    );

    ALTER TABLE logins ADD COLUMN parent_id uuid REFERENCES logins(id);

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE logins DROP COLUMN parent_id;

    DROP TABLE login_shares;

    COMMIT;
    `);
  },
};
