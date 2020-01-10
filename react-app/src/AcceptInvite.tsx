/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import * as _ from "lodash";
import styled, { css } from "styled-components/macro";

import { AppContainer } from "./AppContainer";
import api from "./graphqlApi";
import { Emoji } from "./components/Emoji";
import { Card } from "./components/Card";
import invitePresentIcon from "./img/invite-present-icon.svg";
import { Btn } from "./components/Button";
import {
  Stranger,
  CreateUserInput,
  AcceptInviteAccessKeyInput,
} from "./api/graphql";
import { CreateAccountBanner, CreateAccountForm } from "./CreateAccount";
import { EmojiList } from "./components/EmojiList";
import { LoginPreviewV1 } from "./types/index";
import { possessive } from "./utils";
import { assertNever } from "./assertNever";
import spinnerImg from "./img/spinner.gif";
import { LoadingAnim, LoadingPage } from "./components/LoadingAnim";
import { AppCrypto } from "./crypto";
import { PublicApi } from "./api";
import { WithFlash } from "./Flash";
import { Redirect } from "react-router-dom";
import clientEnv from "./clientEnv";

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

const CircleImg = styled.img`
  height: 45px;
  border-radius: 50px;
`;

const InvitedBySubheader = styled.div`
  font-size: 18px;
  line-height: 22px;
  text-align: center;
  font-weight: 400;
  text-align: center;

  color: #6c7179;
  margin-bottom: 27px;

  & > strong {
    font-weight: bold;
  }
`;

const Explanation = styled.div`
  font-size: 16px;
  line-height: 24px;
  width: 300px;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  margin-bottom: 24px;

  color: #696d74;
`;

const Wrap = styled.div`
  padding-top: 65px;
`;

const CreateAccountWrap = styled.div`
  width: 375px;
  margin: 0 auto;
`;

const Standout = styled.span`
  font-weight: 500;
`;

const LoginList: React.FC<{ logins: LoginPreviewV1[] }> = ({ logins }) => {
  if (logins.length === 0)
    throw new Error("Shouldn't be called with empty list");
  if (logins.length === 1) return <strong>{logins[0].info.title}</strong>;

  if (logins.length === 2)
    return (
      <>
        <strong>{logins[0].info.title}</strong> and{" "}
        <strong>{logins[1].info.title}</strong>
      </>
    );

  if (logins.length > 2)
    return (
      <>
        {logins
          .slice(0, -1)
          .map<React.ReactNode>((login) => <strong>{login.info.title}</strong>)
          .reduce((prev, curr) => [prev, ", ", curr])}
        , and <strong>{logins[logins.length - 1].info.title}</strong>
      </>
    );

  return assertNever();
};

interface EncryptedExplanationProps {
  kind: "encrypted";
  inviter: {
    avatarUrl: string;
    username: string;
  };
  loginCount: number;
  onContinue: () => void;
}

interface DecryptedExplanationProps {
  kind: "decrypted";
  inviter: {
    avatarUrl: string;
    username: string;
  };
  logins: LoginPreviewV1[];
  onContinue: () => void;
}

type ExplanationProps = EncryptedExplanationProps | DecryptedExplanationProps;

export const AcceptInviteExplanation: React.FC<ExplanationProps> = (props) => {
  const shareLoginsText = (count: number) => {
    if (count === 0) throw new Error("Shouldn't be zero");
    if (count === 1) return "wants to share a login with you!";
    if (count > 1) return `wants to share ${count} logins with you!`;
  };

  return (
    <Wrap>
      <Card wide verticalPadding={0}>
        <BannerIcons style={{ marginTop: "-53.5px", marginBottom: "30px" }}>
          <AvatarIcon src={props.inviter.avatarUrl} />
          <PresentIcon />
        </BannerIcons>
        {props.kind === "decrypted" && props.logins.length > 0 ? (
          <>
            <InvitedBySubheader>
              <strong>@{props.inviter.username}</strong> wants to share their{" "}
              <LoginList logins={props.logins} /> account
              {props.logins.length > 1 && "s"} with you!
            </InvitedBySubheader>
            <Explanation>
              Jam helps you <u>share accounts with your friends</u>. Once you
              accept {possessive(props.inviter.username)} invite, you’ll get
              instant access to their <LoginList logins={props.logins} />{" "}
              account{props.logins.length > 1 && "s"}.
            </Explanation>
          </>
        ) : (
          <>
            <InvitedBySubheader>
              <strong>@{props.inviter.username}</strong>{" "}
              {props.kind === "encrypted" && props.loginCount > 0
                ? shareLoginsText(props.loginCount)
                : "invited you to join Jam!"}
            </InvitedBySubheader>
            <Explanation>
              Jam helps you{" "}
              <Standout>share accounts with your friends</Standout>. Here is how
              it works:
            </Explanation>
            <EmojiList>
              <li>
                🤓 <strong>Secure</strong>—When you save a login, it’s
                encrypted. Only you and the friends you share with can decrypt
                it.
              </li>
              <li>
                🙈 <strong>Private</strong>—We <em>literally</em>{" "}
                <u>don’t know</u> what websites you’re sharing, let alone your
                passwords.
              </li>
              <li>
                💁 <strong>Helpful</strong>—We’ll keep track of what services
                you and your friends have accounts on, and recommend how to
                share so you all <u>save money</u>.
              </li>
              <li>
                💖 <strong>On your side</strong>—We want you to enjoy as much of
                the internet as you want, while saving as much money as you can.
              </li>
            </EmojiList>
          </>
        )}
        <div style={{ width: "90%", margin: "0 auto", paddingBottom: "20px" }}>
          <Btn variant="pink" fontSize={24} block onClick={props.onContinue}>
            <Emoji style={{ marginRight: "10px" }}>🚀</Emoji> Accept invite
          </Btn>
        </div>
      </Card>
    </Wrap>
  );
};

export const AcceptInvitePage: React.FC<{
  id: string;
  loginKey: string | null;
  app: AppContainer;
}> = (props) => {
  const [inviter, setInviter] = React.useState<null | Stranger>(null);
  const [continued, setContinued] = React.useState(false);
  const [loginShareSummary, setLoginShareSummary] = React.useState<
    | { kind: "encrypted"; loginCount: number }
    | { kind: "decrypted"; logins: LoginPreviewV1[] }
    | null
  >(null);
  const [sharedKeys, setSharedKeys] = React.useState<
    { id: string; previewKey: CryptoKey; credentialsKey: CryptoKey | null }[]
  >([]);

  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    const loadInivte = async () => {
      const outcome = await new PublicApi().getInvite(props.id);
      if (outcome.kind !== "Success") {
        setNotFound(true);
        return;
      }

      const {
        invite: { from, loginShares },
      } = outcome.data;

      setInviter(from);

      if (loginShares.length === 0) {
        setLoginShareSummary({ kind: "encrypted", loginCount: 0 });
        return;
      }

      // Full share offers, as opposed to login previews from broadcasting
      const numOffers = loginShares.filter(
        (share) => !_.isNull(share.credentialsKey)
      ).length;

      if (!props.loginKey) {
        setLoginShareSummary({
          kind: "encrypted",
          loginCount: numOffers,
        });
        return;
      }

      const importOutcome = await AppCrypto.prototype.importBase64DataKey(
        props.loginKey
      );

      if (importOutcome.outcome === "error") {
        setLoginShareSummary({
          kind: "encrypted",
          loginCount: numOffers,
        });
        return;
      }

      const { key: sharedSecret } = importOutcome;

      try {
        const decryptedLoginShareData = await Promise.all(
          loginShares.map(async (loginShare) => {
            const [previewKey, credentialsKey] = await Promise.all([
              AppCrypto.prototype.unwrapDataKeyWithSharedSecret(
                loginShare.previewKey,
                sharedSecret
              ),
              loginShare.credentialsKey
                ? AppCrypto.prototype.unwrapDataKeyWithSharedSecret(
                    loginShare.credentialsKey,
                    sharedSecret
                  )
                : null,
            ]);

            const preview = await AppCrypto.prototype.decryptVersionedPresharedLoginPreview(
              loginShare.schemaVersion,
              loginShare.preview,
              previewKey
            );

            return {
              id: loginShare.id,
              preview,
              previewKey,
              credentialsKey,
            };
          })
        );

        setLoginShareSummary({
          kind: "decrypted",
          logins: decryptedLoginShareData
            .filter((share) => !_.isNull(share.credentialsKey))
            .map((l) => l.preview),
        });

        setSharedKeys(
          decryptedLoginShareData.map((item) =>
            _.pick(item, ["id", "previewKey", "credentialsKey"])
          )
        );
      } catch (error) {
        // We shouldn't be screwing up the URL in development. Don't let bugs slip by
        if (clientEnv.isDevelopment()) throw error;

        setLoginShareSummary({
          kind: "encrypted",
          loginCount: numOffers,
        });
        return;
      }
    };

    loadInivte();
  }, []);

  if (notFound)
    return (
      <WithFlash kind="error" message="Couldn't find invite">
        <Redirect to="/" />
      </WithFlash>
    );
  if (!inviter || !loginShareSummary) return <LoadingPage />;

  const submitAccount = async (params: CreateUserInput) => {
    let accessKeys: AcceptInviteAccessKeyInput[];
    if (loginShareSummary.kind === "encrypted") {
      accessKeys = [];
    } else {
      accessKeys = await Promise.all(
        sharedKeys.map(async (keys) => {
          const [previewKey, credentialsKey] = await Promise.all([
            AppCrypto.prototype.wrapDataKey(keys.previewKey, params.publicKey),
            keys.credentialsKey
              ? AppCrypto.prototype.wrapDataKey(
                  keys.credentialsKey,
                  params.publicKey
                )
              : null,
          ]);

          return {
            id: keys.id,
            previewKey,
            credentialsKey,
          };
        })
      );
    }
    await api.AcceptInvite({
      params: { id: props.id, user: params, accessKeys },
    });
    return true;
  };

  if (continued)
    return (
      <CreateAccountWrap>
        <CreateAccountBanner>Let's make you an account!</CreateAccountBanner>
        <BannerIcons style={{ marginBottom: "55px" }}>
          <AvatarIcon src={inviter.avatarUrl} />
          <PresentIcon />
        </BannerIcons>
        <CreateAccountForm
          app={props.app}
          submitAccount={submitAccount}
          analyticsLabel="create-account-form/friend-invite"
        />
      </CreateAccountWrap>
    );

  if (loginShareSummary.kind === "encrypted") {
    return (
      <AcceptInviteExplanation
        kind="encrypted"
        inviter={inviter}
        loginCount={loginShareSummary.loginCount}
        onContinue={() => setContinued(true)}
      />
    );
  } else {
    return (
      <AcceptInviteExplanation
        kind="decrypted"
        inviter={inviter}
        logins={loginShareSummary.logins}
        onContinue={() => setContinued(true)}
      />
    );
  }
};
