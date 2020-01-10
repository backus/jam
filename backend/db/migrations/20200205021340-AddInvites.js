"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    CREATE TYPE t_invite_status AS ENUM (
      'pending',
      'accepted',
      'expired'
    );

    
    CREATE DOMAIN t_international_e164_number
    AS character varying(16)
    CONSTRAINT international_e164_number_format
    CHECK (VALUE ~ '\\A\\+\\d{7,15}\\Z')
    NOT NULL;
    
    COMMENT ON DOMAIN t_international_e164_number IS
      'Minimum 7 digits and max of 15 digits.
        E.164 specifies max of 15 digits. Minimum is not as clear.
        From research, Niue can have 7 digit numbers. Could not find
        examples of 6 digit phone numbers.

        @see https://en.wikipedia.org/wiki/List_of_mobile_telephone_prefixes_by_country
        @see https://en.wikipedia.org/wiki/E.164';

    CREATE TABLE invites (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at timestamp without time zone DEFAULT now() NOT NULL,
      updated_at timestamp without time zone DEFAULT now() NOT NULL,
      phone t_international_e164_number NOT NULL,
      from_id uuid NOT NULL REFERENCES users(id),
      to_id uuid REFERENCES users(id),
      status t_invite_status DEFAULT 'pending'::public.t_invite_status NOT NULL,
      CHECK ((status = 'accepted' AND to_id IS NOT NULL) OR (status <> 'accepted' AND to_id IS NULL))
    );

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    DROP TABLE invites;
    DROP TYPE t_invite_status;
    DROP TYPE t_international_e164_number;

    COMMIT;
    `);
  },
};
