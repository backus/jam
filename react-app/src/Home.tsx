import { LoadedApp } from "./AppContainer";
import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import { LoadNotifications } from "./components/Notifications";
import { LoginsViewer } from "./LoginsViewer";
import { OnboardingCard } from "./components/OnboardingCard";
import { Emoji } from "./components/Emoji";
import { Card } from "./components/Card";
import { FlashMessages } from "./Flash";
import { ApiReturnType } from "./graphqlApi";
import { AccountDropdown } from "./components/AccountDropdown";
import { useCurrentBrowserEnv } from "./BrowserEnv";

const Wrap = styled.div`
  margin: 0 auto;
  width: 400px;
`;

const Header = styled.div`
  position: relative;
  height: 36px;
  margin-bottom: 25px;
`;

const Title = styled.h2`
  font-weight: bold;
  font-size: 36px;
  line-height: 42px;
  display: inline;

  color: #ffffff;
`;

const VerifyEmailHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 48px;

  & > ${Emoji} {
    font-size: 48px;
    margin-right: 10px;
    margin-left: -10px;
  }

  & > h1 {
    font-weight: 900;
    font-size: 18px;
    line-height: 48px;
    text-align: center;

    color: #555a60;
  }

  margin-bottom: 30px;
`;

const Explanation = styled.div`
  font-size: 16px;
  line-height: 24px;
  max-width: 300px;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  margin-bottom: 24px;

  color: #696d74;
`;

const HeaderRight = styled.div`
  float: right;
  display: flex;

  & > * {
    margin-left: 10px;
  }
`;

export const Home: React.FC<{ app: LoadedApp }> = (props) => {
  useEffect(() => {
    if (!props.app.state.currentUser.emailVerified) {
      props.app.reloadMe();
    }
  }, []);

  const browserEnv = useCurrentBrowserEnv();

  const signOut = async () => {
    await props.app.signOut();

    // Browser needs to force an HTTP refresh, extension does not
    browserEnv.afterSignOut();
  };

  return props.app.state.currentUser.emailVerified ? (
    <>
      <Header>
        <Title>Accounts</Title>
        <HeaderRight>
          <LoadNotifications app={props.app} />
          <AccountDropdown
            avatarUrl={props.app.state.currentUser.avatarUrl}
            onSignOut={signOut}
          />
        </HeaderRight>
      </Header>
      <FlashMessages />
      <LoginsViewer app={props.app} />
      <OnboardingCard app={props.app} />
    </>
  ) : (
    <Card wide>
      <VerifyEmailHeader>
        <Emoji>📬</Emoji>
        <h1>Almost there!</h1>
      </VerifyEmailHeader>
      <Explanation>
        We need to verify your email before we get started.
      </Explanation>
    </Card>
  );
};
