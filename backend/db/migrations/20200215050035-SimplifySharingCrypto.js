"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    TRUNCATE TABLE login_shares;
    ALTER TABLE login_shares ADD COLUMN encrypted_data_key t_rsa_encrypted_blob NOT NULL;
    ALTER TABLE friend_requests DROP COLUMN initiator_broadcast_key;
    ALTER TABLE friend_requests DROP COLUMN recipient_broadcast_key;
    ALTER TABLE friends DROP COLUMN encrypted_broadcast_key;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    throw new Error("Not reversible!");
  },
};
