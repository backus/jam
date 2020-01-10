"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE TABLE email_verifications (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at timestamp without time zone DEFAULT now() NOT NULL,
      updated_at timestamp without time zone DEFAULT now() NOT NULL,
      user_id uuid NOT NULL REFERENCES users(id)
    );

    ALTER TABLE users ADD COLUMN email_verified boolean DEFAULT false NOT NULL;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    DROP TABLE email_verifications;
    ALTER TABLE users DROP COLUMN email_verified;

    COMMIT;
    `);
  },
};
