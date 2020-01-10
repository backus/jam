"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE TYPE t_login_schema_version AS ENUM (
      'v0',
      'v1'
    );

    CREATE TYPE t_login_type AS ENUM (
      'raw_credentials',
      'browser_state'
    );

    ALTER TABLE login_data ADD COLUMN schema_version t_login_schema_version;
    UPDATE login_data SET schema_version = 'v0';
    ALTER TABLE login_data ALTER COLUMN schema_version SET NOT NULL;
    
    ALTER TABLE login_data ADD COLUMN type t_login_type;
    UPDATE login_data SET type = 'raw_credentials';
    ALTER TABLE login_data ALTER COLUMN type SET NOT NULL;

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
      login_data.share_previews,
      login_data.schema_version,
      login_data.type
    FROM login_data
    JOIN login_access ON login_data.id = login_access.login_data_id;
    

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    DROP VIEW logins;

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

    ALTER TABLE login_data DROP COLUMN schema_version;
    ALTER TABLE login_data DROP COLUMN type;

    DROP TYPE t_login_schema_version;
    DROP TYPE t_login_type;

    COMMIT;
    `);
  },
};
