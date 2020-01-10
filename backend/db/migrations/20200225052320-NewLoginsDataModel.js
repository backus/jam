"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    TRUNCATE TABLE logins CASCADE;
    DROP TABLE login_shares;
    DROP TABLE login_previews;
    DROP TYPE t_login_preview_status;
    DROP TABLE logins;

    CREATE TABLE login_data (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      created_at timestamp without time zone DEFAULT now() NOT NULL,
      updated_at timestamp without time zone DEFAULT now() NOT NULL,
      credentials t_aes_encrypted_blob NOT NULL,
      preview t_aes_encrypted_blob NOT NULL,
      user_id uuid NOT NULL REFERENCES users(id)
    );

    CREATE TYPE t_login_access_status AS ENUM (
      'manager',
      'preview',
      'shared',
      'offer/pending',
      'offer/rejected',
      'request/pending',
      'request/denied'
    );

    CREATE TABLE login_access (
      login_data_id uuid NOT NULL REFERENCES login_data(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES users(id),
      created_at timestamp without time zone DEFAULT now() NOT NULL,
      updated_at timestamp without time zone DEFAULT now() NOT NULL,
      preview_key t_rsa_encrypted_blob NOT NULL,
      credentials_key t_rsa_encrypted_blob,
      status t_login_access_status NOT NULL DEFAULT 'preview',
      PRIMARY KEY (user_id, login_data_id)
    );

    CREATE VIEW logins AS SELECT
      login_data.id,
      login_data.created_at,
      login_data.updated_at,
      credentials,
      preview,
      login_data.user_id AS manager_id,
      preview_key,
      credentials_key,
      login_access.user_id AS member_id,
      login_access.status
    FROM login_data
    JOIN login_access ON login_data.id = login_access.login_data_id;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    throw new Error("No turning back!");
  },
};
