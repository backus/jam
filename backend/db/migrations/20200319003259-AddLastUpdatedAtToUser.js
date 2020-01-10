"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users ADD COLUMN last_active_at TIMESTAMP WITHOUT TIME ZONE;
    UPDATE users SET last_active_at = created_at;
    ALTER TABLE users ALTER COLUMN last_active_at SET NOT NULL;
    ALTER TABLE users ALTER COLUMN last_active_at SET DEFAULT NOW();

    COMMIT;`);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users DROP COLUMN last_active_at;

    COMMIT;`);
  },
};
