"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE invites
      DROP CONSTRAINT "invites_from_id_fkey",
      ADD CONSTRAINT "invites_from_id_fkey"
      FOREIGN KEY (from_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE friends
      DROP CONSTRAINT "friends_friend_id_fkey",
      ADD CONSTRAINT "friends_friend_id_fkey"
      FOREIGN KEY (friend_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE friends
      DROP CONSTRAINT "friends_user_id_fkey",
      ADD CONSTRAINT "friends_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE friend_requests
      DROP CONSTRAINT "friends_recipient_id_fkey",
      ADD CONSTRAINT "friends_recipient_id_fkey"
      FOREIGN KEY (recipient_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE friend_requests
      DROP CONSTRAINT "friends_initiator_id_fkey",
      ADD CONSTRAINT "friends_initiator_id_fkey"
      FOREIGN KEY (initiator_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE login_data
      DROP CONSTRAINT "login_data_user_id_fkey",
      ADD CONSTRAINT "login_data_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE login_access
      DROP CONSTRAINT "login_access_user_id_fkey",
      ADD CONSTRAINT "login_access_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE;

    ALTER TABLE invite_login_access
      DROP CONSTRAINT "invite_login_access_invite_id_fkey",
      ADD CONSTRAINT "invite_login_access_invite_id_fkey"
      FOREIGN KEY (invite_id) REFERENCES invites(id)
      ON DELETE CASCADE;

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER TABLE invites
      DROP CONSTRAINT "invites_from_id_fkey",
      ADD CONSTRAINT "invites_from_id_fkey"
      FOREIGN KEY (from_id) REFERENCES users(id);

    ALTER TABLE friends
      DROP CONSTRAINT "friends_friend_id_fkey",
      ADD CONSTRAINT "friends_friend_id_fkey"
      FOREIGN KEY (friend_id) REFERENCES users(id);

    ALTER TABLE friends
      DROP CONSTRAINT "friends_user_id_fkey",
      ADD CONSTRAINT "friends_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id);

    ALTER TABLE friend_requests
      DROP CONSTRAINT "friends_recipient_id_fkey",
      ADD CONSTRAINT "friends_recipient_id_fkey"
      FOREIGN KEY (recipient_id) REFERENCES users(id);

    ALTER TABLE friend_requests
      DROP CONSTRAINT "friends_initiator_id_fkey",
      ADD CONSTRAINT "friends_initiator_id_fkey"
      FOREIGN KEY (initiator_id) REFERENCES users(id);

    ALTER TABLE login_data
      DROP CONSTRAINT "login_data_user_id_fkey",
      ADD CONSTRAINT "login_data_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id);

    ALTER TABLE login_access
      DROP CONSTRAINT "login_access_user_id_fkey",
      ADD CONSTRAINT "login_access_user_id_fkey"
      FOREIGN KEY (user_id) REFERENCES users(id);

    ALTER TABLE invite_login_access
      DROP CONSTRAINT "invite_login_access_invite_id_fkey",
      ADD CONSTRAINT "invite_login_access_invite_id_fkey"
      FOREIGN KEY (invite_id) REFERENCES invites(id);

    COMMIT;
    `);
  },
};
