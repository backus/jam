"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE friend_requests ADD CONSTRAINT unique_requests UNIQUE (initiator_id, recipient_id);

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE friend_requests DROP CONSTRAINT unique_requests;

    COMMIT;
    `);
  },
};
