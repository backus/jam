"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE TYPE t_waitlist_status AS ENUM (
      'waiting',
      'invited',
      'accepted'
    );

    ALTER TABLE waitlist_entries ADD COLUMN id uuid NOT NULL UNIQUE DEFAULT uuid_generate_v4();
    ALTER TABLE waitlist_entries ADD COLUMN status t_waitlist_status NOT NULL DEFAULT 'waiting';
    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE waitlist_entries DROP COLUMN id;
    ALTER TABLE waitlist_entries DROP COLUMN status;

    COMMIT;
    `);
  },
};
