"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER DOMAIN nonempty_string DROP CONSTRAINT not_blank;
    ALTER DOMAIN nonempty_string ADD CONSTRAINT not_blank CHECK (length(trim(VALUE)) > 0);

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    ALTER DOMAIN nonempty_string DROP CONSTRAINT not_blank;
    ALTER DOMAIN nonempty_string ADD CONSTRAINT not_blank CHECK (VALUE::text ~ '\\A[[:alnum:]][[:alnum:] ]+\\Z' AND length(trim(VALUE)) > 0);

    COMMIT;
    `);
  },
};
