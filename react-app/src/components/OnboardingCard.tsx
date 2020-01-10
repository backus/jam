import React from "react";
import { Card } from "./Card";
import { Emoji } from "./Emoji";
import { EmojiList } from "./EmojiList";
import { SubmitBtn } from "./SubmitBtn";
import styled from "styled-components/macro";
import { LoadedApp } from "../AppContainer";
import { ApiReturnType } from "../graphqlApi";
import { Btn } from "./Button";

const OnboardHeader = styled.div`
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

const DismissBtn = styled(SubmitBtn)`
  background: #5389f2;
  font-size: 16px;
  line-height: unset;
  min-height: 35px;
  width: 100%;
  max-width: 300px;
  justify-content: center;
  margin: 30px auto 0 auto;
  padding: 10px 0;
  display: flex;
`;

type Me = ApiReturnType<"GetMe">["me"];

const Wrap = styled.div`
  max-width: 300px;
  margin: 0 auto;
`;

export const OnboardingCard: React.FC<{ app: LoadedApp }> = (props) => {
  const [me, setMe] = React.useState<null | Me>(null);

  const loadMe = async () => {
    const { me: result } = await props.app.graphql().GetMe();

    setMe(result);
  };

  const dismissOnboardCard = async () => {
    await props.app.graphql().DismissOnboardingCard();
    loadMe();
  };

  React.useEffect(() => {
    loadMe();
  }, []);

  if (!me) return null;
  if (!me.showOnboardingCard) return null;

  return (
    <Card wide verticalPadding={55}>
      <OnboardHeader>
        <Emoji>👋</Emoji>
        <h1>Welcome to Jam!</h1>
      </OnboardHeader>
      <Explanation>
        Jam makes it easy to share accounts with your friends. Here’s the idea:
      </Explanation>

      <Wrap>
        <EmojiList style={{ lineHeight: "24px" }}>
          <li>👪 Add as many friends as you want.</li>
          <li>💾 Add logins to other websites to Jam.</li>
          <li>🎁 Share your logins with friends. Ask them to share back.</li>
          <li>🤑 Consume more, pay less.</li>
        </EmojiList>
      </Wrap>
      <Btn variant="blue" block fontSize={16} onClick={dismissOnboardCard}>
        ok thanks don’t show me this again
      </Btn>
    </Card>
  );
};
