"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE DOMAIN t_username citext CHECK (VALUE::text ~ '\\A[a-zA-Z0-9_]+\\Z');

    ALTER TABLE users ADD COLUMN username t_username;
    UPDATE users SET username = display_name;
    ALTER TABLE users ALTER COLUMN username SET NOT NULL;
    ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);
    ALTER TABLE users DROP COLUMN display_name;

    DROP DOMAIN t_user_display_name;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE DOMAIN t_user_display_name AS character varying(50)
      CONSTRAINT t_user_display_name_check CHECK ((((VALUE)::text ~ '\\A[a-zA-Z0-9 _]+\\Z'::text) AND ((VALUE)::text ~ '\\A[a-zA-Z0-9]'::text) AND ((VALUE)::text ~ '[a-zA-Z0-9]\\Z'::text)));

    TRUNCATE TABLE users RESTART IDENTITY CASCADE;

    ALTER TABLE users DROP COLUMN username;
    ALTER TABLE users ADD COLUMN display_name t_username NOT NULL UNIQUE;

    DROP DOMAIN t_username;

    COMMIT;
    `);
  },
};
