"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users ALTER COLUMN avatar_url SET DEFAULT '/img/no-avatar.png';
    ALTER TABLE users ALTER COLUMN avatar_url SET NOT NULL;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE users ALTER COLUMN avatar_url DROP DEFAULT;
    ALTER TABLE users ALTER COLUMN avatar_url DROP NOT NULL;

    COMMIT;
    `);
  },
};
