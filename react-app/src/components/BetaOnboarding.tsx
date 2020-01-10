import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useTransition, animated } from "react-spring";
import styled, { css } from "styled-components/macro";
import * as _ from "lodash";
import { SimpleCard } from "./../components/Card";
import { Btn } from "./../components/Button";

import approvedImg from "./../img/approved.svg";
import whiteApprovedImg from "./../img/approved-white.svg";

import { isFilled, isEmail } from "../utils";
import { LoadedApp } from "../AppContainer";
import {
  RsaEncryptedBlob,
  LoginSchemaVersion,
  LoginType,
} from "../api/graphql";
import { addFlash } from "../Flash";
import { LoginMapper } from "../loginSchemaMapper";
import { LoginV1 } from "../types";

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
`;

const ExtraDetail = styled.p`
  font-style: italic;
  color: #8d939c;
  text-align: center;
`;

const TextInput = styled.input<{
  approved?: boolean;
}>`
  flex-grow: 1;
  width: 100%;
  height: 35px;
  padding: 0 10px;
  margin-right: 11px;

  font-size: 16px;
  font-weight: 500;

  border: 2.5px solid #f3f2f9;
  box-sizing: border-box;
  border-radius: 5px;
  outline: none;
  color: #83868b;
  caret-color: #83868b;

  &::placeholder {
    color: #d4d5d6;
  }

  ${(props) =>
    props.approved &&
    css`
      background-image: url(${approvedImg});
      background-repeat: no-repeat;
      background-position: right 10px center;

      &:not(:focus) {
        background: #51c777;
        color: white;
        font-weight: 700;
        border: 2.5px solid #51c777;
        background-image: url(${whiteApprovedImg});
        background-repeat: no-repeat;
        background-position: right 10px center;
      }
    `}
`;

const StepFooter = styled.div`
  font-size: 14px;
  text-align: center;
  font-style: italic;
  color: #bfc7d0;
  margin-top: 20px;
`;

const OnboardSection = styled(animated.div)`
  margin: 25px 0 0 0;

  & > ${TextInput} {
    margin-bottom: 10px;
  }
`;

const NextStepBtn = styled(Btn)`
  margin-top: 20px;
`;

const useSlideIn = (
  show: boolean
): [React.RefObject<HTMLDivElement>, ReturnType<typeof useTransition>] => {
  const [innerHeight, setInnerHeight] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);
  const [displayContent, setDisplayContent] = useState(false);

  useEffect(() => {
    if (show) setDisplayContent(true);
  }, [show]);

  const transitions = useTransition(displayContent, null, {
    from: { height: 0, opacity: 0 },
    enter: { height: innerHeight, opacity: 1 },
    leave: { height: 0, opacity: 0 },
    config: { duration: 250 },
  });

  useEffect(() => {
    const elem = innerRef.current;
    if (!elem) return;
    const { marginTop, marginBottom } = getComputedStyle(elem);
    setInnerHeight(
      elem.offsetHeight + parseInt(marginTop) + parseInt(marginBottom)
    );
  }, [innerRef]);

  return [innerRef, transitions];
};

const SlideDownWrapper = styled(animated.div)`
  overflow: hidden;
`;

type TOnboardLogin = {
  id: string | undefined;
  title: string;
  username: string;
  password: string;
};
type TOnboardFriend = { id?: string; nickname: string; email: string | null };
type TOnboardForm = {
  login: TOnboardLogin;
  friends: TOnboardFriend[];
};

export const BetaOnboardAddLogin: React.FC<
  Partial<TOnboardForm> & {
    onSubmit: (data: TOnboardLogin) => Promise<void>;
  }
> = (props) => {
  const [login, setLogin] = useState({
    id: undefined,
    title: "",
    username: "",
    password: "",
    ...props.login,
  });

  const titleIsFilled = login.title.length > 2;

  const [credentialsRef, credentialsTransition] = useSlideIn(titleIsFilled);

  const title = () =>
    titleIsFilled ? (
      <>
        How do you login to <strong>{login.title}</strong>?
      </>
    ) : (
      "What service do you share with friends?"
    );

  const footer = () =>
    titleIsFilled
      ? "Jam's encryption is special. It's impossible for us to view or use your login information."
      : "We take privacy seriously. Even Jam doesn’t know what services you use.";

  const validations = {
    login: {
      title: isFilled(login.title) && login.title.length > 2,
      username: isFilled(login.username),
      password: isFilled(login.password),
    },
  };

  const allValid = (
    value: boolean | { [key: string]: boolean | { [key: string]: boolean }[] }
  ): boolean => {
    if (_.isArray(value)) return value.every((item) => allValid(item));
    if (_.isObject(value)) return Object.values(value).every((item) => item);
    else return value;
  };

  const formValid =
    validations.login.title &&
    validations.login.username &&
    validations.login.password;

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (formValid) props.onSubmit(login);
  };

  return (
    <SimpleCard data-jam-analyze="card/beta-onboarding">
      <Body marginPadding={40}>
        <h2>{title()}</h2>
        {!titleIsFilled && (
          <ExtraDetail>
            This should be a service where your friends are using{" "}
            <strong>your</strong> login credentials.
          </ExtraDetail>
        )}
        {titleIsFilled && (
          <ExtraDetail>
            All login information on Jam is encrypted and private. Only friends
            you share it with will be able to view it. This is secure.
          </ExtraDetail>
        )}
        <form onSubmit={handleSubmit}>
          <TextInput
            data-jam-analyze="input/login-title"
            tabIndex={0}
            placeholder="Streamable"
            name="login.title"
            autoFocus={!validations.login.title}
            value={login.title}
            onChange={(ev) =>
              setLogin({ ...login, title: ev.currentTarget.value })
            }
            approved={validations.login.title}
          />
          {credentialsTransition.map(({ key, props }) => (
            <SlideDownWrapper key={key} style={props}>
              <OnboardSection ref={credentialsRef}>
                <input type="hidden" name="login.id" value={login.id || ""} />
                <TextInput
                  data-jam-analyze="input/login-username"
                  tabIndex={0}
                  placeholder={`${login.title} username`}
                  name="login.username"
                  onChange={(ev) =>
                    setLogin({ ...login, username: ev.currentTarget.value })
                  }
                  value={login.username}
                  approved={validations.login.username}
                />
                <TextInput
                  data-jam-analyze="input/login-password"
                  tabIndex={0}
                  placeholder={`${login.title} password`}
                  name="login.password"
                  type="password"
                  onChange={(ev) =>
                    setLogin({ ...login, password: ev.currentTarget.value })
                  }
                  value={login.password}
                  approved={validations.login.password}
                />
                <NextStepBtn
                  variant="pink"
                  data-jam-analyze="btn/beta-onboarding/send-invite"
                  fontSize={18}
                  block
                  disabled={!formValid}
                >
                  Save login
                </NextStepBtn>
              </OnboardSection>
            </SlideDownWrapper>
          ))}
        </form>
        <StepFooter>{footer()}</StepFooter>
      </Body>
    </SimpleCard>
  );
};

const SkipInviteLink = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

const BetaOnboardingInviteFriends: React.FC<{
  loginTitle: string;
  onSubmit: (friend: TOnboardFriend) => Promise<any>;
  onSkip: () => Promise<any>;
}> = (props) => {
  const [submitting, setSubmitting] = useState(false);

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  const validations = {
    nickname: nickname.length > 2 && nickname.length < 16,
    email: isEmail(email),
  };

  const isDisabled = !validations.nickname || !validations.email || submitting;

  return (
    <SimpleCard>
      <Body marginPadding={40}>
        <h2>
          Who do you share your <strong>{props.loginTitle}</strong> account
          with?
        </h2>
        <ExtraDetail>
          Jam only makes sense with friends. You should invite someone to share
          your <strong>{props.loginTitle}</strong> account.
        </ExtraDetail>
        <form
          data-jam-analyze="form/beta-onboarding/invite-friend"
          onSubmit={async (event) => {
            event.preventDefault();
            if (isDisabled) return;

            setSubmitting(true);
            await props.onSubmit({ nickname, email });
            setSubmitting(false);
          }}
        >
          <OnboardSection>
            <TextInput
              tabIndex={0}
              data-jam-analyze="input/invite-friend/nickname"
              placeholder="John B."
              name="nickname"
              value={nickname}
              onChange={(ev) =>
                setNickname(ev.currentTarget.value.replace(/^\s+/, ""))
              }
              approved={validations.nickname}
              maxLength={15}
            />
            <TextInput
              tabIndex={0}
              data-jam-analyze="input/invite-friend/email"
              placeholder="john@example.com"
              name="email"
              type="text"
              value={email}
              onChange={(ev) =>
                setEmail(ev.currentTarget.value.replace(/\s/g, ""))
              }
              approved={validations.email}
            />
          </OnboardSection>
          <NextStepBtn variant="pink" fontSize={18} block disabled={isDisabled}>
            Send invite
          </NextStepBtn>
        </form>
        <StepFooter>
          <SkipInviteLink
            onClick={async () => {
              if (submitting) return;

              setSubmitting(true);
              await props.onSkip();
              setSubmitting(false);
            }}
            data-jam-analyze="btn/beta-onboarding/skip-invite-friend"
          >
            I don't want to invite someone, yet.
          </SkipInviteLink>
        </StepFooter>
      </Body>
    </SimpleCard>
  );
};

// Slightly different from TOnboardFriend because we need to track keys and stuff for
// presharing logins
interface TOnboardInvite extends TOnboardFriend {
  key?: RsaEncryptedBlob;
  loginShares?: { id: string }[];
}

export const BetaOnboardPage: React.FC<{ app: LoadedApp }> = (props) => {
  const [onboardingState, setOnboardingState] = useState<{
    login?: TOnboardLogin;
    friends: TOnboardInvite[];
  }>({ friends: [] });

  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"add_login" | "invite_friends">("add_login");

  const { currentUser, crypto } = props.app.state;

  useEffect(() => {
    const loadOnboarding = async () => {
      const { logins, invites } = await props.app.graphql().GetBetaOnboarding();

      if (logins.length > 0) {
        const login = await crypto.decryptVersionedSharedLoginCredentials(
          logins[0].schemaVersion,
          logins[0].credentials,
          {
            encryptedDataKey: logins[0].credentialsKey,
            privKey: currentUser.privateKey,
          }
        );

        setOnboardingState({
          login: {
            id: logins[0].id,
            title: login.info.title,
            username: login.secret.rawCredentials!.username,
            password: login.secret.rawCredentials!.password,
          },
          friends: invites,
        });
      } else {
        setOnboardingState({ friends: invites });
      }

      setLoaded(true);
    };

    loadOnboarding();
  }, []);

  useEffect(() => {
    const preshareLogin = async (
      loginId: string,
      invitedFriend: { id: string; dataKey: RsaEncryptedBlob }
    ) => {
      await props.app.api().preshareLogin({
        loginId,
        invitedFriend,
      });

      setOnboardingState({
        login,
        friends: onboardingState.friends.map((friend) => {
          if (friend.id !== invitedFriend.id) return friend;
          return {
            ...friend,
            loginShares: (friend.loginShares || []).concat({ id: loginId }),
          };
        }),
      });
    };

    if (!onboardingState) return;
    const { login, friends } = onboardingState;
    if (!login?.id) return;
    const loginId = login.id;
    if (!friends) return;

    friends.map(({ id, key, loginShares }) => {
      if (!id) return;
      if (!key) return;
      if (_.map(loginShares || [], "id").includes(loginId)) return;

      preshareLogin(loginId, { id, dataKey: key });
    });
  }, [onboardingState]);

  if (!loaded) return null;

  const handleLoginChange = async (
    login: TOnboardLogin
  ): Promise<TOnboardLogin> => {
    if (_.isEqual(onboardingState?.login, login)) return login;

    if (
      [login.title, login.username, login.password].some(
        (value) => !_.isString(value) || value.trim() === ""
      )
    )
      return login;

    if (_.isString(login.id)) {
      // TODO: Switch to API fn
      const {
        login: {
          credentialsKey: encryptedCredentialsKey,
          previewKey: encryptedPreviewKey,
        },
      } = await props.app.graphql().GetLoginKeys({ id: login.id });

      const [credentialsKey, previewKey] = await currentUser.unwrapDataKeys([
        encryptedCredentialsKey,
        encryptedPreviewKey,
      ]);

      const newLogin: LoginV1 = {
        info: { title: login.title, domain: null },
        detail: {},
        secret: { rawCredentials: _.pick(login, ["username", "password"]) },
      };

      const [newCredentials, newPreview] = await Promise.all([
        crypto.encryptSharedLoginV1(newLogin, credentialsKey),
        crypto.encryptSharedLoginPreviewV1(
          _.pick(newLogin, "info"),
          previewKey
        ),
      ]);

      await props.app.graphql().UpdateLogin({
        params: {
          id: login.id,
          credentials: newCredentials,
          preview: newPreview,
          newFriendShares: [],
          newInviteShares: [],
          revokedFriendShares: [],
          revokedInviteShares: [],
          sharePreviews: true,
          schemaVersion: LoginSchemaVersion.V0,
        },
      });

      setOnboardingState({
        login,
        friends: onboardingState.friends,
      });

      return login;
    }

    const newLogin = _.omit(login, "id");

    // Don't push changes if the login isn't filled out fully
    if (!_.every(newLogin, (val) => _.isString(val) && isFilled(val)))
      return login;

    const {
      createLogin: { id, credentials, credentialsKey, schemaVersion },
    } = await props.app.addLogin({
      details: {
        info: {
          title: newLogin.title,
          domain: null,
        },
        detail: {},
        secret: {
          rawCredentials: {
            username: newLogin.username,
            password: newLogin.password,
          },
        },
      },
      shareWith: [],
      sharePreviews: true,
      type: LoginType.RawCredentials,
    });

    const privKey = currentUser.privateKey;
    // I decrypt the result and return that as a sanity check. It should be a noop,
    // but if it isn't we'll probably notice it earlier in development
    const decrypted = await crypto.decryptVersionedSharedLoginCredentials(
      schemaVersion,
      credentials,
      {
        encryptedDataKey: credentialsKey,
        privKey,
      }
    );

    const persistedLogin = {
      id,
      ...decrypted,
    };

    setOnboardingState({
      login: {
        id,
        ...LoginMapper.loginV1ToV0(persistedLogin),
      },
      friends: onboardingState.friends,
    });

    return {
      id: persistedLogin.id,
      ...LoginMapper.loginV1ToV0(persistedLogin),
    };
  };

  const handleInvitesChange = (
    login: TOnboardLogin,
    invites: TOnboardFriend[]
  ): Promise<TOnboardInvite[]> =>
    Promise.all(
      invites.map(async (invite, index) => {
        const currentInvite: TOnboardLogin | {} =
          onboardingState.friends[index] || {};

        if (!invite.email) return invite;
        if (!invite.nickname) return invite;

        if (!isEmail(invite.email as string)) return invite;

        if ((currentInvite as any).id) {
          await props.app.graphql().UpdateInvite({
            id: (currentInvite as any).id,
            changes: {
              nickname: invite.nickname,
              email: invite.email,
            },
          });
          return { ...currentInvite, ...invite };
        } else {
          const { id, encryptedKey } = await props.app.api().createInvite({
            nickname: invite.nickname,
            email: invite.email,
            phone: null,
          });

          if (login.id) {
            await props.app.api().preshareLogin({
              loginId: login.id,
              invitedFriend: {
                id,
                dataKey: encryptedKey,
              },
            });
          }

          return { id, key: encryptedKey, ...invite };
        }
      })
    );

  const finishBetaOnboarding = async () => {
    await props.app.graphql().FinishBetaOnboarding();
    addFlash({ kind: "success", message: "You're in! Welcome to Jam" });
    await props.app.reloadMe();
  };

  if (mode === "add_login") {
    return (
      <BetaOnboardAddLogin
        login={onboardingState.login}
        onSubmit={async (ev: TOnboardLogin) => {
          const login = await handleLoginChange(ev);
          setOnboardingState({
            ...onboardingState,
            login,
          });
          setMode("invite_friends");
        }}
      />
    );
  } else {
    return (
      <BetaOnboardingInviteFriends
        loginTitle={onboardingState.login?.title || ""}
        onSubmit={async (invite) => {
          if (!onboardingState.login)
            throw new Error("Type ordering messed up");
          await handleInvitesChange(onboardingState.login, [invite]);
          await finishBetaOnboarding();
        }}
        onSkip={async () => {
          await finishBetaOnboarding();
        }}
      />
    );
  }
};
