import React, { useEffect, useState } from "react";

import { LoadedApp } from "./AppContainer";
import { Card, Cards } from "./components/Card";
import { LoginDetailFake } from "./components/LoginDetail";
import * as _ from "lodash";
import inviteImg from "./img/invite-friend.svg";
import { Stranger } from "./api/graphql";
import styled from "styled-components/macro";
import { LoginDescription } from "./components/LoginDescription";
import { Btn, DoneBtn } from "./components/Button";
import { LoginPreviewV1 } from "./types";

type LoginMember = Pick<Stranger, "id" | "username" | "avatarUrl">;

export const PublicImg = (props: { name: string; alt: string }) => (
  <img
    src={`/img/${props.name.toLowerCase().replace(" ", "-")}.png`}
    alt={props.alt}
  />
);

const LoginMember: React.FC<{ member: LoginMember }> = ({ member }) => (
  <Member>
    <img src={member.avatarUrl || ""} />
    <MemberName>{member.username}</MemberName>
  </Member>
);

const Member = styled.div`
  display: flex;
  flex-direction: column;
  width: 75px;
  margin-right: 58px;
  margin-bottom: 20px;

  & img {
    display: block;
    width: 70px;
    height: 70px;
    box-shadow: 0px 4px 3px rgba(0, 0, 0, 0.05);
    border-radius: 75px;
    margin-bottom: 16.5px;
  }
`;

const MemberName = styled.span`
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: normal;
  line-height: 16px;
  text-align: center;

  color: rgba(44, 60, 85, 0.4);
`;

const Blur = styled.div`
  filter: blur(6px);
  opacity: 0.7;
`;

const TextOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 24px;

  & > p {
    margin-bottom: 35px;
  }

  & > b {
    display: inline-block;
    white-space: nowrap;
  }
`;

export const ViewLoginPreview: React.FC<{
  id: string;
  app: LoadedApp;
}> = (props) => {
  const [loginPreview, setLoginPreview] = useState<{
    id: string;
    createdAt: string;
    accessRequested: boolean;
    preview: LoginPreviewV1;
    friend: { id: string; username: string; avatarUrl: string };
  } | null>(null);

  const loadLoginPreview = async () => {
    const { loginPreview } = await props.app
      .graphql()
      .GetLoginPreview({ id: props.id });

    const preview = await props.app.state.crypto.decryptVersionedSharedLoginPreview(
      loginPreview.schemaVersion,
      loginPreview.preview,
      {
        encryptedDataKey: loginPreview.previewKey,
        privKey: props.app.state.currentUser.privateKey,
      }
    );

    setLoginPreview({
      id: loginPreview.id,
      createdAt: loginPreview.createdAt,
      accessRequested: loginPreview.accessRequested,
      preview: preview,
      friend: loginPreview.manager,
    });
  };

  const requestAccess = async (id: string) => {
    await props.app.graphql().RequestLoginShare({ id });
    loadLoginPreview();
    return true;
  };

  useEffect(() => {
    loadLoginPreview();
  }, []);

  if (!loginPreview) return null;
  return (
    <>
      <Cards>
        <Card wide verticalPadding={30}>
          <LoginDescription
            kind="shared"
            friendUsername={loginPreview.friend.username}
            friendAvatarUrl={loginPreview.friend.avatarUrl}
            loginTitle={loginPreview.preview.info.title}
            loginDomain={loginPreview.preview.info.domain}
          />
        </Card>
        <Card wide flush label="details" verticalPadding={30}>
          <TextOverlay>
            {loginPreview.accessRequested ? (
              <>
                <p>
                  ⏳ Waiting for {loginPreview.friend.username} to respond...
                </p>
                <DoneBtn fontSize={18}>Access requested</DoneBtn>
              </>
            ) : (
              <>
                <p>
                  {loginPreview.friend.username} has an account on{" "}
                  <b>{loginPreview.preview.info.title}</b>.
                </p>
                <Btn
                  variant="pink"
                  fontSize={18}
                  onClick={() => requestAccess(loginPreview.id)}
                >
                  Ask {loginPreview.friend.username} to share
                </Btn>
              </>
            )}
          </TextOverlay>
          <Blur onClick={(e) => e.stopPropagation()}>
            <LoginDetailFake
              kind="username"
              type="password"
              name="email"
              value="fake date"
            />
            <LoginDetailFake
              kind="password"
              type="password"
              name="password"
              value="fake data"
            />
          </Blur>
        </Card>
      </Cards>
    </>
  );
};
