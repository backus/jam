"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE TABLE invite_login_access (
      login_data_id uuid NOT NULL REFERENCES login_data(id) ON DELETE CASCADE,
      invite_id uuid NOT NULL REFERENCES invites(id),
      created_at timestamp without time zone DEFAULT now() NOT NULL,
      updated_at timestamp without time zone DEFAULT now() NOT NULL,
      preview_key t_aes_encrypted_blob NOT NULL,
      credentials_key t_aes_encrypted_blob,
      status t_login_access_status NOT NULL DEFAULT 'preview' CHECK (status = 'preview' OR status = 'offer/pending'),
      PRIMARY KEY (invite_id, login_data_id)
    );

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    DROP TABLE invite_login_access;

    COMMIT;
    `);
  },
};
