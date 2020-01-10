"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE srp_handshakes
      DROP CONSTRAINT "srp_handshakes_user_id_fkey",
      ADD CONSTRAINT "srp_handshakes_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE email_verifications
      DROP CONSTRAINT "email_verifications_user_id_fkey",
      ADD CONSTRAINT "email_verifications_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE srp_handshakes
      DROP CONSTRAINT "srp_handshakes_user_id_fkey",
      ADD CONSTRAINT "srp_handshakes_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id);

    ALTER TABLE email_verifications
      DROP CONSTRAINT "email_verifications_user_id_fkey",
      ADD CONSTRAINT "email_verifications_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id);

    COMMIT;
    `);
  },
};
