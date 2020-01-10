import React, { useEffect } from "react";
import styled, { css } from "styled-components/macro";
import { LoadedApp } from "../AppContainer";

import { Redirect } from "react-router-dom";
import { glow } from "./glow";
import { ApiReturnType } from "../graphqlApi";
import { Unboxed, Replace, ReplaceEach } from "../generics";
import { acceptFriendRequest, rejectFriendRequest } from "../friendRequests";
import { LoginIcon } from "./LoginIcon";
import { LoginPreviewV1 } from "../types";
import { Notification } from "./Notification";

const Notifications = styled.div`
  & > * {
    margin-bottom: 50px;
  }
`;

type TNotifs = ApiReturnType<"GetNotifications">;
type TDecryptedShares = ReplaceEach<
  TNotifs["loginShares"],
  "preview",
  LoginPreviewV1
>;
type TDecryptedRequests = ReplaceEach<
  TNotifs["shareRequests"],
  "preview",
  LoginPreviewV1
>;

type TNotifications = Replace<
  Replace<TNotifs, "loginShares", TDecryptedShares>,
  "shareRequests",
  TDecryptedRequests
>;

type LoginShare = Unboxed<TNotifications["loginShares"]>;
type ShareRequest = Unboxed<TNotifications["shareRequests"]>;

export const ViewNotifications = ({ app }: { app: LoadedApp }) => {
  const [
    notifications,
    setNotifications,
  ] = React.useState<TNotifications | null>(null);
  const [loading, setLoading] = React.useState(true);

  const getNotifications = async () => {
    const notifications = await app.graphql().GetNotifications();
    const privKey = app.state.currentUser.privateKey;

    const loginShares = await Promise.all(
      notifications.loginShares.map(async (share) => {
        const preview = await app.state.crypto.decryptVersionedSharedLoginPreview(
          share.schemaVersion,
          share.preview,
          {
            encryptedDataKey: share.previewKey,
            privKey,
          }
        );

        return {
          ...share,
          preview,
        };
      })
    );

    const shareRequests = await Promise.all(
      notifications.shareRequests.map(async (share) => {
        const preview = await app.state.crypto.decryptVersionedSharedLoginPreview(
          share.schemaVersion,
          share.preview,
          { encryptedDataKey: share.previewKey, privKey }
        );

        return {
          ...share,
          preview,
        };
      })
    );

    setNotifications({ ...notifications, loginShares, shareRequests });
    setLoading(false);
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const rejectLoginShare = async (share: LoginShare) => {
    await app.graphql().RejectLoginShare({ id: share.id });
  };

  const approveShareRequest = async (request: ShareRequest) => {
    const { currentUser, crypto } = app.state;
    const dataKey = await currentUser.unwrapDataKey(request.credentialsKey);
    const theirKey = await crypto.wrapDataKey(
      dataKey,
      request.member.publicKey
    );

    return app.graphql().ApproveShareRequest({
      params: {
        id: request.id,
        memberId: request.member.id,
        credentialsKey: theirKey,
      },
    });
  };

  const rejectShareRequest = async (request: ShareRequest) => {
    await app
      .graphql()
      .RejectShareRequest({ id: request.id, memberId: request.member.id });
  };

  if (
    !loading &&
    notifications &&
    Object.values(notifications).every(
      (value) => ((value as any) as any[]).length === 0
    )
  ) {
    return <Redirect to="/" />;
  }

  if (!notifications) return null;

  return (
    <Notifications>
      {notifications.loginShares.map((share, i) => (
        <Notification
          key={share.id}
          primaryImg={
            <LoginIcon circle loginTitle={share.preview.info.title} size={90} />
          }
          secondaryImg={share.manager.avatarUrl}
          description={
            <p>
              <b>{share.manager.username}</b> wants to share their{" "}
              <b>{share.preview.info.title}</b> account with you. Do you want
              access?
            </p>
          }
          acceptText="yes!!"
          acceptDoneText="done! enjoy"
          rejectText="no"
          rejectDoneText="done"
          onAccept={async () => {
            await app.graphql().AcceptLoginShare({ loginId: share.id });
            getNotifications();
          }}
          onReject={async () => {
            await rejectLoginShare(share);
            getNotifications();
          }}
        />
      ))}
      {notifications.shareRequests.map((request, i) => (
        <Notification
          key={request.id}
          primaryImg={
            <LoginIcon
              circle
              loginTitle={request.preview.info.title}
              size={90}
            />
          }
          secondaryImg={request.member.avatarUrl}
          description={
            <p>
              <b>{request.member.username}</b> asked to join your{" "}
              <b>{request.preview.info.title}</b> account. That cool?
            </p>
          }
          acceptText="sure"
          acceptDoneText="done! you're a good friend"
          rejectText="not right now"
          rejectDoneText="done"
          onAccept={async () => {
            await approveShareRequest(request);
            getNotifications();
          }}
          onReject={async () => {
            await rejectShareRequest(request);
            getNotifications();
          }}
        />
      ))}
      {notifications.friendRequests.map((friendReq, i) => (
        <Notification
          key={i}
          primaryImg={friendReq.initiator.avatarUrl}
          description={
            <p>
              <b>{friendReq.initiator.username}</b> wants to be your friend. Are
              you comfortable sharing accounts with them?
            </p>
          }
          acceptText="yes!"
          acceptDoneText="done!"
          rejectText="no"
          rejectDoneText="got it"
          onAccept={async () => {
            await acceptFriendRequest(app, friendReq.id);
            getNotifications();
          }}
          onReject={async () => {
            await rejectFriendRequest(app, friendReq.id);
            getNotifications();
          }}
        />
      ))}
    </Notifications>
  );
};
