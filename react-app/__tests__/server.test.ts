import app from "../server/server";

import * as srpClient from "secure-remote-password/client";
import supertest from "supertest";
import { sequelize } from "../server/models";
import * as _ from "lodash";

const graphql = async (query: string, variables: object = {}) => {
  const response = await supertest(app)
    .post("/graphql")
    .send({ query, variables });

  if ("errors" in response.body) {
    throw new Error("GraphQL query failed! " + JSON.stringify(response.body));
  }

  return response.body;
};

const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

afterEach(async () => {
  // sigh
  await sequelize.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
});

it("returns fake SRP values if an unknown email is given", async () => {
  const res = await graphql(
    `
      mutation StartSRPHandshake($params: StartSRPHandshakeInput!) {
        startSRPHandshake(params: $params) {
          id
          srpSalt
          serverPublicEphemeral
        }
      }
    `,
    {
      params: {
        email: "doesnotexist@example.com",
        clientPublicEphemeral: _.repeat("a", 512),
      },
    }
  );

  expect(res.data.startSRPHandshake).toMatchObject({
    id: expect.stringMatching(uuidV4Regex),
    srpSalt: expect.stringMatching(/^[0-9a-f]{64}$/),
    serverPublicEphemeral: expect.stringMatching(/^[0-9a-f]{512}$/),
  });
});

it("creates a user and then authenticates with SRP", async () => {
  const email = "testuser@example.com";
  const password = "asdf123!";

  const srpSalt = srpClient.generateSalt();
  const privateKey = srpClient.derivePrivateKey(srpSalt, email, password);
  const srpVerifier = srpClient.deriveVerifier(privateKey);

  await graphql(
    `
      mutation CreateUserDemo($params: CreateUserInput!) {
        createUser(params: $params) {
          id
          email
          createdAt
          updatedAt
          srpSalt
        }
      }
    `,
    { params: { email, srpSalt, srpVerifier } }
  );

  const ephemeral = srpClient.generateEphemeral();
  const startResponse = await graphql(
    `
      mutation StartSRPHandshake($params: StartSRPHandshakeInput!) {
        startSRPHandshake(params: $params) {
          id
          srpSalt
          serverPublicEphemeral
        }
      }
    `,
    {
      params: {
        email,
        clientPublicEphemeral: ephemeral.public,
      },
    }
  );

  const clientSession = srpClient.deriveSession(
    ephemeral.secret,
    startResponse.data.startSRPHandshake.serverPublicEphemeral,
    srpSalt,
    email,
    privateKey
  );

  const finishSRPHandshake = await graphql(
    `
      mutation FinishSRPHandshake($params: FinishSRPHandshakeInput!) {
        finishSRPHandshake(params: $params) {
          id
          serverProof
        }
      }
    `,
    {
      params: {
        id: startResponse.data.startSRPHandshake.id,
        clientProof: clientSession.proof,
      },
    }
  );

  // Throws if invalid session
  srpClient.verifySession(
    ephemeral.public,
    clientSession,
    finishSRPHandshake.data.finishSRPHandshake.serverProof
  );
});
