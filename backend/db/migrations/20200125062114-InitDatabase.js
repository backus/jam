"use strict";

module.exports = {
  up: async (queryInterface, _) => {
    await queryInterface.sequelize.query(`
    BEGIN TRANSACTION;

    
    CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


    CREATE DOMAIN public.email_address AS public.citext
      CONSTRAINT email_address_check CHECK ((VALUE OPERATOR(public.~) '\\A[^@\\s;,]+@[^@\\s;,]+\\.[^@\\s;,]+\\Z'::public.citext));


    CREATE DOMAIN public.t_aes_encrypted_blob AS json
      CONSTRAINT t_aes_encrypted_blob_check CHECK ((((VALUE ->> 'algorithm'::text) = 'AES-GCM'::text) AND ((VALUE)::jsonb ?& ARRAY['ciphertext'::text, 'iv'::text, 'salt'::text, 'algorithm'::text])));


    CREATE TYPE public.t_friend_status AS ENUM (
        'pending',
        'accepted',
        'rejected'
    );


    CREATE DOMAIN public.t_public_key AS character varying(750)
      CONSTRAINT t_public_key_format CHECK ((length((VALUE)::text) = 736));


    COMMENT ON DOMAIN public.t_public_key IS 'Private key is generated client-side and then encrypted with the user''s master key using AES-GCM. It is 4096 bit RSA-OAEP key.';


    CREATE DOMAIN public.t_rsa_encrypted_blob AS json
      CONSTRAINT t_rsa_encrypted_blob_check CHECK ((((VALUE ->> 'algorithm'::text) = 'RSA-OAEP'::text) AND ((VALUE)::jsonb ?& ARRAY['ciphertext'::text, 'algorithm'::text])));


    CREATE DOMAIN public.t_srp_ephemeral_public AS character varying(512)
      CONSTRAINT srp_ephemeral_public_format CHECK ((((VALUE)::text ~ '\\A[a-f0-9]+\\Z'::text) AND (length((VALUE)::text) = 512)));


    CREATE DOMAIN public.t_srp_ephemeral_secret AS character varying(64)
      CONSTRAINT srp_ephemeral_secret_format CHECK ((((VALUE)::text ~ '\\A[a-f0-9]+\\Z'::text) AND (length((VALUE)::text) = 64)));


    CREATE DOMAIN public.t_srp_salt AS character varying(64)
      CONSTRAINT srp_salt_format CHECK ((((VALUE)::text ~ '\\A[a-f0-9]+\\Z'::text) AND (length((VALUE)::text) = 64)));


    CREATE DOMAIN public.t_srp_session_key AS character varying(64)
      CONSTRAINT srp_session_key_format CHECK ((((VALUE)::text ~ '\\A[a-f0-9]+\\Z'::text) AND (length((VALUE)::text) = 64)));


    CREATE DOMAIN public.t_srp_verifier AS character varying(512)
      CONSTRAINT srp_verifier_format CHECK ((((VALUE)::text ~ '\\A[a-f0-9]+\\Z'::text) AND (length((VALUE)::text) = 512)));


    CREATE DOMAIN public.t_user_display_name AS character varying(50)
      CONSTRAINT t_user_display_name_check CHECK ((((VALUE)::text ~ '\\A[a-zA-Z0-9 _]+\\Z'::text) AND ((VALUE)::text ~ '\\A[a-zA-Z0-9]'::text) AND ((VALUE)::text ~ '[a-zA-Z0-9]\\Z'::text)));


    SET default_tablespace = '';

    SET default_table_access_method = heap;

    CREATE TABLE public.friend_requests (
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        updated_at timestamp without time zone DEFAULT now() NOT NULL,
        initiator_id uuid NOT NULL,
        recipient_id uuid NOT NULL,
        status public.t_friend_status DEFAULT 'pending'::public.t_friend_status NOT NULL,
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        initiator_broadcast_key public.t_aes_encrypted_blob,
        recipient_broadcast_key public.t_rsa_encrypted_blob,
        CONSTRAINT friend_requests_check CHECK ((((status = 'pending'::public.t_friend_status) AND (initiator_broadcast_key IS NOT NULL) AND (recipient_broadcast_key IS NOT NULL)) OR ((status <> 'pending'::public.t_friend_status) AND (initiator_broadcast_key IS NULL) AND (recipient_broadcast_key IS NULL)))),
        CONSTRAINT friends_check CHECK ((initiator_id <> recipient_id))
    );


    CREATE TABLE public.friends (
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        updated_at timestamp without time zone DEFAULT now() NOT NULL,
        friend_request_id uuid NOT NULL,
        user_id uuid NOT NULL,
        friend_id uuid NOT NULL,
        encrypted_broadcast_key public.t_aes_encrypted_blob NOT NULL
    );


    CREATE TABLE public.logins (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        updated_at timestamp without time zone DEFAULT now() NOT NULL,
        login public.t_aes_encrypted_blob NOT NULL,
        user_id uuid NOT NULL
    );


    CREATE TABLE public.srp_handshakes (
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        updated_at timestamp without time zone DEFAULT now() NOT NULL,
        client_public public.t_srp_ephemeral_public NOT NULL,
        server_secret public.t_srp_ephemeral_secret NOT NULL,
        session_key public.t_srp_session_key,
        user_id uuid NOT NULL
    );


    CREATE TABLE public.users (
        email public.email_address NOT NULL,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        updated_at timestamp without time zone DEFAULT now() NOT NULL,
        srp_salt public.t_srp_salt NOT NULL,
        srp_verifier public.t_srp_verifier NOT NULL,
        vault_metadata public.t_aes_encrypted_blob NOT NULL,
        vault_metadata_last_updated_at timestamp without time zone DEFAULT now() NOT NULL,
        public_key public.t_public_key NOT NULL,
        encrypted_private_key public.t_aes_encrypted_blob NOT NULL,
        id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
        display_name public.t_user_display_name NOT NULL
    );


    ALTER TABLE ONLY public.friend_requests
        ADD CONSTRAINT friend_requests_pkey PRIMARY KEY (id);


    ALTER TABLE ONLY public.friends
        ADD CONSTRAINT friends_user_id_friend_id_key UNIQUE (user_id, friend_id);


    ALTER TABLE ONLY public.logins
        ADD CONSTRAINT logins_pkey PRIMARY KEY (id);


    ALTER TABLE ONLY public.srp_handshakes
        ADD CONSTRAINT srp_handshakes_pk PRIMARY KEY (id);


    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_email_key UNIQUE (email);


    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_pkey PRIMARY KEY (id);


    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_srp_salt_key UNIQUE (srp_salt);


    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_srp_verifier_key UNIQUE (srp_verifier);


    CREATE INDEX initiator_recipient_friend_requests ON public.friend_requests USING btree (initiator_id, recipient_id);


    CREATE INDEX recipient_initiator_friends ON public.friend_requests USING btree (recipient_id, initiator_id);


    ALTER TABLE ONLY public.friends
        ADD CONSTRAINT friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id);


    ALTER TABLE ONLY public.friends
        ADD CONSTRAINT friends_friend_request_id_fkey FOREIGN KEY (friend_request_id) REFERENCES public.friend_requests(id);


    ALTER TABLE ONLY public.friend_requests
        ADD CONSTRAINT friends_initiator_id_fkey FOREIGN KEY (initiator_id) REFERENCES public.users(id);


    ALTER TABLE ONLY public.friend_requests
        ADD CONSTRAINT friends_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id);


    ALTER TABLE ONLY public.friends
        ADD CONSTRAINT friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


    ALTER TABLE ONLY public.logins
        ADD CONSTRAINT logins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


    ALTER TABLE ONLY public.srp_handshakes
        ADD CONSTRAINT srp_handshakes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

    COMMIT;
    `);
  },

  down: async (queryInterface, _) => {
    await queryInterface.sequelize.query(``);
  },
};
