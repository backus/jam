/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import styled, { css, keyframes } from "styled-components/macro";
import * as _ from "lodash";
import { SimpleCard } from "./../components/Card";
import { EmojiList } from "./../components/EmojiList";
import { Btn } from "./../components/Button";
import { CreateAccountBanner, CreateAccountForm } from "./../CreateAccount";
import { AppContainer } from "../AppContainer";
import invitePresentIcon from "./../img/invite-present-icon.svg";
import graphql from "./../graphqlApi";
import { WithFlash } from "../Flash";
import { Redirect } from "react-router-dom";
import { CreateUserInput } from "../api/graphql";
import { addToBugsnagUser } from "./../bugsnagUser";
import { PublicApi } from "../api";

const AcceptInviteFooter = styled.div``;
const FooterText = styled.div`
  font-style: italic;
  font-weight: 400;
  text-align: center;
  font-size: 14px;
`;

const Body = styled.div<{ marginPadding?: number }>`
  color: #555a60;

  padding: 20px
    ${(props) => (props.marginPadding ? `${props.marginPadding}px` : "20px")};

  h1 {
    font-weight: 900;
    font-size: 24px;
    text-align: center;
    margin-bottom: 30px;
  }

  h2 {
    font-size: 18px;
    font-weight: 500;
    text-align: center;

    & strong {
      font-weight: 900;
    }
  }

  p {
    font-size: 16px;
    font-weight: 400;
    margin-bottom: 30px;
    line-height: 1.53;
  }

  & > ${AcceptInviteFooter} {
    & > hr {
      margin: 30px auto;
      width: 50%;
      outline: none;
      border: 1px solid #d0d1d2;
    }

    margin-bottom: 20px;
  }
`;

const BannerIcon = css`
  border-radius: 100px;
  border: 2px solid #ffffff;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  height: 107px;
  width: 107px;
`;

const PresentIcon = styled.div`
  ${BannerIcon}
  background: url(${invitePresentIcon}),
    linear-gradient(150.3deg, #f56ff8 11.57%, #e36fd8 87.53%);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 50px, contain;
`;

const AvatarIcon = styled.img`
  ${BannerIcon}
`;

const BannerIcons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 107px;

  & > img,
  ${PresentIcon} {
    position: absolute;

    &:first-child {
      left: 97px;
      z-index: 1;
    }

    &:last-child {
      left: 170px;
    }
  }
`;

export const AcceptBetaInvite: React.FC<{ onAccept: () => void }> = (props) => {
  return (
    <SimpleCard>
      <Body>
        <h1>We choose you! 🥰</h1>
        <p>
          Congrats! We <em>hand-picked</em> you to join Jam’s private beta. We
          want you to have:
        </p>
        <EmojiList>
          <li>💝 Early access to new features</li>
          <li>😎 Exclusive invites for your friends</li>
        </EmojiList>
        <p>
          We think this could be the start of something really cool and we’re
          excited to have you. ❤️
        </p>
        <Btn
          data-jam-analyze="btn/accept-beta-invite"
          variant="pink"
          fontSize={24}
          block
          onClick={props.onAccept}
        >
          Create my Jam account!
        </Btn>
        <AcceptInviteFooter>
          <hr />
          <FooterText>
            Jam helps you share access to services with your friends, instantly
            and securely.
          </FooterText>
        </AcceptInviteFooter>
      </Body>
    </SimpleCard>
  );
};

export const BetaInvitePage: React.FC<{
  app: AppContainer;
  id: string;
}> = (props) => {
  const [mode, setMode] = useState<"view" | "create_account">("view");
  const [email, setBetaInviteEmail] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBetaInvite = async () => {
      const outcome = await new PublicApi().waitlistEntry(props.id);
      if (outcome.kind !== "Success") return; // TODO: Error handle?
      setBetaInviteEmail(outcome.data.email);
      setLoading(false);

      addToBugsnagUser({ beta: { email } });
    };

    loadBetaInvite();
  }, []);

  if (loading) return null;
  if (!email)
    return (
      <WithFlash kind="error" message="Invite beta invite id">
        <Redirect to="/" />
      </WithFlash>
    );

  const handleSubmit = async (params: CreateUserInput): Promise<boolean> => {
    await graphql.AcceptBetaInvite({
      params: { id: props.id, user: _.omit(params, "email") },
    });
    return true;
  };

  if (mode === "view") {
    return <AcceptBetaInvite onAccept={() => setMode("create_account")} />;
  } else {
    return (
      <>
        <CreateAccountBanner>Let's make you an account!</CreateAccountBanner>
        <CreateAccountForm
          analyticsLabel="create-account-form/beta-invite"
          readonly={{ email }}
          app={props.app}
          submitAccount={handleSubmit}
        />
      </>
    );
  }
};
