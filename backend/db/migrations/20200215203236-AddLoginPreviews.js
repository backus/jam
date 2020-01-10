"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE TYPE t_login_preview_status AS ENUM (
      'preview',
      'requested',
      'accepted',
      'rejected',
      'transferring',
      'transferred'
    );

    CREATE TABLE login_previews (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at timestamp without time zone DEFAULT now() NOT NULL,
      updated_at timestamp without time zone DEFAULT now() NOT NULL,
      login_id uuid NOT NULL REFERENCES logins(id),
      from_id uuid NOT NULL REFERENCES users(id),
      to_id uuid NOT NULL REFERENCES users(id),
      preview t_aes_encrypted_blob NOT NULL,
      preview_key t_rsa_encrypted_blob NOT NULL,
      status t_login_preview_status NOT NULL DEFAULT 'preview',
      credentials t_aes_encrypted_blob,
      credentials_key t_rsa_encrypted_blob
    );

    ALTER TABLE login_previews ADD CONSTRAINT transferring_credentials CHECK (
      ((status = 'transferring') AND (credentials IS NOT NULL) AND (credentials_key IS NOT NULL))
      OR ((status <> 'transferring') AND (credentials IS NULL) AND (credentials_key IS NULL))
    );

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    DROP TABLE login_previews;
    DROP TYPE t_login_preview_status;

    COMMIT;
    `);
  },
};
