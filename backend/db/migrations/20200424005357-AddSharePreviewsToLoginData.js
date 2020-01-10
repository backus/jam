"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE login_data ADD COLUMN share_previews boolean DEFAULT true NOT NULL;

    CREATE OR REPLACE VIEW logins AS SELECT
      login_data.id,
      login_data.created_at,
      login_data.updated_at,
      credentials,
      preview,
      login_data.user_id AS manager_id,
      preview_key,
      credentials_key,
      login_access.user_id AS member_id,
      login_access.status,
      login_data.share_previews
    FROM login_data
    JOIN login_access ON login_data.id = login_access.login_data_id;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE login_data DROP COLUMN share_previews;

    CREATE OR REPLACE VIEW logins AS SELECT
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
};
