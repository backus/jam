import React, { useState, useEffect } from "react";
import { Box, Text } from "rebass/styled-components";
import { useHistory, Redirect } from "react-router-dom";
import { Modal } from "./Modal";
import { Page } from "./Page";
import { LoadedApp } from "../AppContainer";
import { SocialGraphFriend } from "../FindFriends";
import { LoadingPage } from "./LoadingAnim";
import { WithFlash } from "../Flash";
import { Avatar } from "../Avatar";
import theme from "../theme";
import { transparentize } from "polished";
import { LoginBar } from "./LoginBar";
import { LoginPreviewV1 } from "../types";
import { LoginType } from "../api/graphql";

export type DecryptedSocialGraphFriend = {
  id: string;
  username: string;
  avatarUrl: string;
} & Record<
  | "loginsSharedWithThem"
  | "loginsSharedWithMe"
  | "loginPreviewsVisibleToThem"
  | "loginPreviewsVisibleToMe",
  {
    id: string;
    type: LoginType;
    preview: LoginPreviewV1;
  }[]
>;

const LoginBarSection: React.FC<{
  logins: {
    id: string;
    type: LoginType;
    preview: LoginPreviewV1;
  }[];
  heading: string;
  renderLoginBar: (login: {
    id: string;
    type: LoginType;
    preview: LoginPreviewV1;
  }) => any;
}> = ({ logins, heading, renderLoginBar }) => {
  if (logins.length === 0) return null;
  return (
    <Box mt="30px" width="100%">
      <Text fontSize="20px" fontWeight="bold" textAlign="left" color="white">
        {heading}
      </Text>
      {logins.map((login) => (
        <Box mt="25px">{renderLoginBar(login)}</Box>
      ))}
    </Box>
  );
};

export const ViewFriendship: React.FC<{ app: LoadedApp; friendId: string }> = (
  props
) => {
  const history = useHistory<{ modal?: boolean }>();
  const [friend, setFriend] = useState<DecryptedSocialGraphFriend | null>(null);
  const [apiError, setApiError] = useState<null | string>(null);
  const { currentUser } = props.app.state;

  useEffect(() => {
    const loadFriend = async () => {
      const outcome = await props.app
        .api()
        .getFriendWithShareGraph(props.friendId);

      if (outcome.kind === "Success") {
        setFriend(outcome.data);
      } else {
        setApiError(outcome.kind);
      }
    };

    loadFriend();
  }, []);

  const shouldWrapWithModal = !!history.location.state?.modal;

  if (apiError) {
    const message =
      apiError === "NotFound"
        ? "Couldn't find a friend with that id"
        : "An error occurred while looking up this user";
    return (
      <WithFlash kind="error" message={message}>
        <Redirect to="/" />
      </WithFlash>
    );
  }

  if (!friend) return <LoadingPage />;

  let overlayBg = "linear-gradient(166.4deg, #4A148C -8.69%, #31115E 109.49%)";
  let header = "";
  let headerEmoji = "🙄";
  let subheader:
    | string
    | React.ReactElement = `You and ${friend.username} aren’t sharing anything with each other.`;

  if (
    friend.loginsSharedWithThem.length > 0 &&
    friend.loginsSharedWithMe.length > 0
  ) {
    overlayBg = "linear-gradient(164.37deg, #FBC740 -8.88%, #E040FB 105.4%)";
    header = "Woohoo! ";
    headerEmoji = "😍";
    subheader = (
      <>
        You and {friend.username} are both sharing with each other.{" "}
        <Text display="inline" fontStyle="italic">
          How cute.
        </Text>
      </>
    );
  }

  if (
    friend.loginsSharedWithThem.length === 0 &&
    friend.loginsSharedWithMe.length > 0
  ) {
    overlayBg = "linear-gradient(164.37deg, #6CC3F3 -8.88%, #5258ED 105.4%)";
    header = "Yikes ";
    headerEmoji = "😬";
    subheader = `${friend.username} is sharing with you. Want to give something back?`;
  }
  if (
    friend.loginsSharedWithMe.length === 0 &&
    friend.loginsSharedWithThem.length > 0
  ) {
    overlayBg = "linear-gradient(166.4deg, #F76969 -8.69%, #C92A2A 109.49%)";
    header = "Hmm ";
    headerEmoji = "🤔";
    subheader = `${friend.username} isn’t sharing anything with you... yet!`;
  }

  const body = (
    <Box
      py="20px"
      m="0 auto"
      sx={{
        borderRadius: "5px",
        "@media screen and (max-width: 767px)": {
          width: "calc(100vw - 20px)",
          display: "block",
        },
        "@media screen and (min-width: 768px)": {
          width: "100%",
          maxWidth: "500px",
        },
      }}
    >
      <Text
        textAlign="center"
        fontSize="60px"
        fontWeight="900"
        fontStyle="italic"
        color={transparentize(0.1, "white")}
        sx={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.05)" }}
      >
        {header}
        <Text display="inline" fontStyle="normal">
          {headerEmoji}
        </Text>
      </Text>
      <Text
        m="20px auto 0 auto"
        textAlign="center"
        fontSize="18px"
        fontWeight="medium"
        color={transparentize(0.1, "white")}
        sx={{ textShadow: "1px 1px 1px rgba(0, 0, 0, 0.05)" }}
      >
        {subheader}
      </Text>
      <Box width="250px" m="0 auto">
        <Box display="flex" width="225px" mt="48px" mx="auto">
          <Avatar
            circle
            size="100px"
            uri={currentUser.avatarUrl}
            sx={{ border: `3px solid white` }}
          />
          <Box display="inline-block" width="25px" />
          <Avatar
            circle
            size="100px"
            uri={friend!.avatarUrl}
            sx={{ border: `3px solid white` }}
          />
        </Box>
      </Box>
      <LoginBarSection
        heading={`${friend.username} is sharing...`}
        logins={friend.loginsSharedWithMe}
        renderLoginBar={(login) => (
          <LoginBar
            uri={`/login/${login.id}`}
            kind="shared"
            title={login.preview.info.title}
            userAvatarUrl={currentUser.avatarUrl}
            friendAvatarUrl={friend.avatarUrl}
            friendUsername={friend.username}
          />
        )}
      />
      <LoginBarSection
        heading="You are sharing..."
        logins={friend.loginsSharedWithThem}
        renderLoginBar={(login) => (
          <LoginBar
            uri={`/login/${login.id}`}
            kind="mine"
            title={login.preview.info.title}
            userAvatarUrl={currentUser.avatarUrl}
          />
        )}
      />
      <LoginBarSection
        heading={`You could invite ${friend.username} to...`}
        logins={friend.loginPreviewsVisibleToThem}
        renderLoginBar={(login) => (
          <LoginBar
            uri={`/login/${login.id}`}
            kind="mine"
            title={login.preview.info.title}
            userAvatarUrl={currentUser.avatarUrl}
          />
        )}
      />
      <LoginBarSection
        heading={`You could ask ${friend.username} for an invite to...`}
        logins={friend.loginPreviewsVisibleToMe}
        renderLoginBar={(login) => (
          <LoginBar
            uri={`/login/preview/${login.id}`}
            kind="preview"
            title={login.preview.info.title}
            friendAvatarUrl={friend.avatarUrl}
            friendUsername={friend.username}
          />
        )}
      />
    </Box>
  );

  return shouldWrapWithModal ? (
    <Modal
      fadeIn
      noStyleContainer
      sx={{ width: "100%" }}
      overlayBg={overlayBg}
      showCloseButton
      onClose={() => history.goBack()}
    >
      {body}
    </Modal>
  ) : (
    <Page>{body}</Page>
  );
};
