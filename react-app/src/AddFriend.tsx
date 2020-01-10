import React from "react";
import { Card, SectionHeader } from "./components/Card";
import styled, { css, keyframes } from "styled-components/macro";
import { AppContainer, LoadedApp } from "./AppContainer";

import smsImg from "./img/invite-via-sms.svg";
import emailImg from "./img/invite-via-email.svg";
import { AesEncryptedBlob, RsaEncryptedBlob, Invite } from "./api/graphql";
import { ApiReturnType } from "./graphqlApi";
import * as _ from "lodash";
import { AddFriendRow } from "./components/AddFriendRow";
import { InviteVia } from "./components/InviteVia";
import { InviteModal } from "./components/InviteModal";
import { Friend } from "./api/graphql";
import { NoImagePlaceholder } from "./components/NoImagePlaceholder";
import clientEnv from "./clientEnv";
import { syncLoginAccessKeys } from "./sync";

const SelectFriendsHeader = styled.span`
  font-weight: 900;
  font-size: 18px;
  line-height: 21px;
  /* identical to box height */

  text-transform: uppercase;

  color: #c8c8c8;

  display: block;

  margin: 20px 0 20px 24px;
`;

const shareLogin = async (props: {
  app: LoadedApp;
  loginId: string;
  friend: { id: string; publicKey: string };
}) => {
  const app = props.app.assertLoaded();
  const { crypto, currentUser } = app.state;

  const {
    login: {
      credentialsKey: encryptedCredentialsKey,
      previewKey: encryptedPreviewKey,
    },
  } = await props.app.graphql().GetLogin({ id: props.loginId });

  const [previewKey, credentialsKey] = await currentUser.unwrapDataKeys([
    encryptedPreviewKey,
    encryptedCredentialsKey,
  ]);

  const [theirPreviewKey, theirCredentialsKey] = await Promise.all([
    crypto.wrapDataKey(previewKey, props.friend.publicKey),
    crypto.wrapDataKey(credentialsKey, props.friend.publicKey),
  ]);

  await props.app.graphql().ShareLogin({
    params: {
      friendId: props.friend.id,
      loginId: props.loginId,
      previewKey: theirPreviewKey,
      credentialsKey: theirCredentialsKey,
    },
  });
};

type TShare = ApiReturnType<"GetPotentialShares">["potentialShares"];

const FamiliarFaces = styled.div`
  padding: 10px 0;

  & > * {
    margin-top: 28px;

    &:first-child {
      margin-top: 0;
    }
  }
`;

export const AddFriend: React.FC<{ id: string; app: LoadedApp }> = (props) => {
  const [loginTitle, setLoginTitle] = React.useState<string | null>(null);
  const [potentialShares, setPotentialShares] = React.useState<TShare>([]);
  const [showInviteModal, setShowInviteModal] = React.useState(false);

  const { currentUser, crypto } = props.app.state;

  React.useEffect(() => {
    const loadLogin = async () => {
      const { login } = await props.app.graphql().GetLogin({ id: props.id });
      const credentials = await crypto.decryptVersionedSharedLoginCredentials(
        login.schemaVersion,
        login.credentials,
        {
          encryptedDataKey: login.credentialsKey,
          privKey: currentUser.privateKey,
        }
      );
      setLoginTitle(credentials.info.title);
    };

    loadLogin();
  }, []);

  React.useEffect(() => {
    const loadShareData = async () => {
      const res = await props.app
        .graphql()
        .GetPotentialShares({ id: props.id });

      setPotentialShares(res.potentialShares);
    };
    loadShareData();
  }, [props.app, props.id]);

  const desc = (accountsSharing: number) => {
    if (accountsSharing === 0) {
      return "Not sharing with you… yet!";
    } else {
      return `Sharing ${accountsSharing} account${
        accountsSharing > 1 ? "s" : ""
      } with you`;
    }
  };

  return (
    <>
      {showInviteModal && (
        <InviteModal
          createInvite={async (nickname) => {
            const {
              id,
              linkKey,
              encryptedKey,
            } = await props.app.api().createInvite({
              nickname,
              phone: null,
              email: null,
            });

            const inviteUrl = clientEnv.absolutePath(
              `/invite/${id}#${linkKey}`
            );

            await props.app.api().preshareLogin({
              loginId: props.id,
              invitedFriend: {
                id,
                dataKey: encryptedKey,
              },
            });

            props.app.syncLoginAccessKeys();

            return inviteUrl.toString();
          }}
          onClose={() => setShowInviteModal(false)}
        />
      )}
      <Card wide flush label="ADD A FRIEND" verticalPadding={20}>
        <InviteVia
          type="link"
          text="Generate invite link"
          onClick={() => setShowInviteModal(true)}
        />
        <SectionHeader>Familiar faces</SectionHeader>
        <FamiliarFaces>
          {potentialShares.map((share, i) => {
            if (share.friend.kind === "Friend") {
              const user: {
                id: string;
                name: string;
                avatarUrl: string;
                publicKey: string;
              } = share.friend;

              return (
                <AddFriendRow
                  key={i}
                  avatarUri={user.avatarUrl || ""}
                  name={user.name}
                  description={desc(share.numSharing)}
                  onAdd={async () => {
                    shareLogin({
                      app: props.app,
                      loginId: props.id,
                      friend: user,
                    });
                  }}
                />
              );
            } else if (share.friend.kind === "Invite") {
              const user: {
                id: string;
                name: string;
                dataKey: RsaEncryptedBlob;
              } = share.friend;
              return (
                <AddFriendRow
                  key={i}
                  name={user.name}
                  description={`You invited ${user.name} to Jam`}
                  onAdd={async () =>
                    props.app.api().preshareLogin({
                      loginId: props.id,
                      invitedFriend: user,
                    })
                  }
                />
              );
            }
          })}
        </FamiliarFaces>
      </Card>
    </>
  );
};
