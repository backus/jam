import React, { useEffect, useState, useContext } from "react";
import { SubmitButton, LabeledInputField } from "./UI";
import { Card } from "./components/Card";

import { formValidations, parseISOTime } from "./utils";

import { Link } from "react-router-dom";
import { Form } from "react-final-form";
import styled, { css, keyframes } from "styled-components/macro";

import { AddFriendCard, AddLoginCard } from "./components/ActionCard";
import { LoginBar } from "./components/LoginBar";
import { Me } from "./api/graphql";
import { LoadedApp } from "./AppContainer";
import { ApiReturnType, TApiFn } from "./graphqlApi";
import { Unboxed } from "./generics";
import { LoginPreviewV1 } from "./types";
import { LoadingPage, LoadingAnim } from "./components/LoadingAnim";
import { Box } from "rebass/styled-components";
import sub from "date-fns/sub";

const Actions = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 25px;
  position: relative;
  justify-content: space-between;
`;

const LoginWrap = styled.div`
  margin: 15px 0;
`;

/**
 * Given the name of a field in the GraphQL API response, define
 * a corresponding interface with all the same field types except
 * for the field specified by {FieldName}. Replace the type of the
 * value at {FieldName} with `LoginPreviewV1` which
 * is a (subset of) the decrypted data type
 */
type DecryptedLoginType<
  SectionName extends keyof ApiReturnType<"GetLoginsOverview">,
  FieldName extends keyof Unboxed<
    ApiReturnType<"GetLoginsOverview">[SectionName]
  >
> = (Omit<Unboxed<ApiReturnType<"GetLoginsOverview">[SectionName]>, FieldName> &
  Record<FieldName, LoginPreviewV1>)[];

type TLoginOverview = {
  mine: DecryptedLoginType<"mine", "credentials">;
  shared: DecryptedLoginType<"shared", "credentials">;
  previews: DecryptedLoginType<"previews", "preview">;
};

export const LoginsViewer: React.FC<{
  app: LoadedApp;
}> = (props) => {
  const [logins, setLogins] = useState<TLoginOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const { crypto, currentUser } = props.app.state;

  useEffect(() => {
    const loadLogins = async () => {
      const {
        mine: mineEncrypted,
        shared: sharedEncrypted,
        previews: previewsEncrypted,
      } = await props.app.graphql().GetLoginsOverview();

      const mine = await Promise.all(
        mineEncrypted.map(async (login) => {
          const metadata = await crypto.decryptVersionedSharedLoginCredentials(
            login.schemaVersion,
            login.credentials,
            {
              encryptedDataKey: login.credentialsKey,
              privKey: currentUser.privateKey,
            }
          );
          return { ...login, credentials: metadata };
        })
      );

      const shared = await Promise.all(
        sharedEncrypted.map(async (login) => {
          const metadata = await crypto.decryptVersionedSharedLoginCredentials(
            login.schemaVersion,
            login.credentials,
            {
              encryptedDataKey: login.credentialsKey,
              privKey: currentUser.privateKey,
            }
          );
          return { ...login, credentials: metadata };
        })
      );

      const previews = await Promise.all(
        previewsEncrypted.map(async (login) => {
          const metadata = await crypto.decryptVersionedSharedLoginPreview(
            login.schemaVersion,
            login.preview,
            {
              encryptedDataKey: login.previewKey,
              privKey: currentUser.privateKey,
            }
          );
          return { ...login, preview: metadata };
        })
      );

      setLoading(false);
      setLogins({ mine, shared, previews });
    };

    loadLogins();
  }, []);

  return (
    <>
      <Actions>
        <AddFriendCard to="/friends/new" />
        <AddLoginCard to="/logins/new" />
      </Actions>
      {loading ? (
        <Box width="80px" m="20px auto">
          <LoadingAnim />
        </Box>
      ) : (
        logins &&
        logins.mine
          .map((login, index) => {
            return (
              <LoginWrap key={login.id}>
                <LoginBar
                  new={
                    parseISOTime(login.createdAt) >
                    sub(new Date(), { weeks: 1 })
                  }
                  kind="mine"
                  uri={`/login/${login.id}`}
                  title={login.credentials.info.title}
                  userAvatarUrl={props.app.state.currentUser.avatarUrl}
                />
              </LoginWrap>
            );
          })
          .concat(
            logins.shared.map((login, index) => {
              return (
                <LoginWrap key={login.id}>
                  <LoginBar
                    kind="shared"
                    uri={`/login/${login.id}`}
                    title={login.credentials.info.title}
                    friendAvatarUrl={login.manager.avatarUrl}
                    friendUsername={login.manager.username}
                    userAvatarUrl={props.app.state.currentUser.avatarUrl}
                  />
                </LoginWrap>
              );
            })
          )
          .concat(
            logins.previews.map((login, index) => {
              return (
                <LoginWrap key={login.id}>
                  <LoginBar
                    kind="preview"
                    uri={`/login/preview/${login.id}`}
                    title={login.preview.info.title}
                    friendAvatarUrl={login.manager.avatarUrl}
                    friendUsername={login.manager.username}
                  />
                </LoginWrap>
              );
            })
          )
      )}
    </>
  );
};
