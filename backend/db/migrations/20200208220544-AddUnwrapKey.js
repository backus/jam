"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    DELETE FROM srp_handshakes;
    ALTER TABLE srp_handshakes ADD COLUMN session_wrapper varchar NOT NULL;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE srp_handshakes DROP COLUMN session_wrapper;

    COMMIT;
    `);
  },
};
