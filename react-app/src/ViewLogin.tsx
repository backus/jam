import * as React from "react";

import { AppContainer, LoadedApp } from "./AppContainer";
import { Card, Cards, SimpleCard, InfoCard } from "./components/Card";
import {
  LoginDetail,
  LoginDetailStatic,
  LoginDetailStaticPassword,
} from "./components/LoginDetail";
import * as _ from "lodash";
import inviteImg from "./img/invite-friend.svg";
import externalLinkImg from "./img/external-link-white.svg";
import {
  Stranger,
  Maybe,
  Me,
  Friend,
  ShareRecipient,
  LoginType,
} from "./api/graphql";
import styled, { keyframes, css } from "styled-components/macro";
import { Link, Redirect } from "react-router-dom";
import { LoginIcon } from "./components/LoginIcon";
import { LoginDescription } from "./components/LoginDescription";
import { useEffect, useState } from "react";
import { ApiReturnType } from "./graphqlApi";
import { Replace, Expand } from "./generics";
import { LoginV1 } from "./types/index";
import { InviteFriend, LoginMember, Grid } from "./components/LoginMember";
import { EditBtn } from "./components/ActionBtns";
import { EditLogin } from "./components/EditLogin";
import {
  TShareRecipient,
  ILoginUpdate,
  IShareRecipientFriend,
  IShareRecipientInvite,
  TLoginMember,
} from "./api";
import { WithFlash } from "./Flash";
import { LoginMapper } from "./loginSchemaMapper";
import { MagicLinkCard } from "./components/MagicLinkCard";
import { Box, Text, Flex } from "rebass/styled-components";
import { Btn, IconBtn, ExternalLinkBtn } from "./components/Button";
import { useCurrentBrowserEnv, BrowserEnv } from "./BrowserEnv";
import { Modal } from "./components/Modal";
import { FloatingIcon } from "./components/FloatingIcon";
import magicLinkHat from "./img/magic-link.svg";
import { LoadingSpinner } from "./components/Loading";
import {
  ExtensionRequired,
  useExtensionAvailability,
} from "./components/ExtensionRequired";
import { possessive } from "./utils";
import { Emoji } from "./components/Emoji";
import { NotFound } from "./components/NotFound";
import { LoadingPage } from "./components/LoadingAnim";

type LoginMember = Pick<Stranger, "id" | "username" | "avatarUrl">;

export const PublicImg = (props: { name: string; alt: string }) => (
  <img
    src={`/img/${props.name.toLowerCase().replace(" ", "-")}.png`}
    alt={props.alt}
  />
);

type TViewLogin = Expand<
  Omit<
    Replace<ApiReturnType<"GetLogin">["login"], "credentials", LoginV1>,
    "preview" | "credentialsKey" | "previewKey"
  > & { sharePreviews?: boolean }
>;

const LoginNote = styled.div`
  font-size: 16px;
  color: #555a60;
  text-align: left;
  line-height: 24px;
`;

const Actions = styled.div`
  padding: 0 0 20px 0;
  width: 100%;
  height: 35px;

  & > button {
    float: right;
  }
`;

const UpdateLogin: React.FC<{
  type: LoginType;
  login: LoginV1;
  sharingWith: TShareRecipient[];
  sharePreviews: boolean;
  friends: TShareRecipient[];
  onSave: (data: ILoginUpdate) => Promise<any>;
  onDelete: () => Promise<any>;
}> = (props) => {
  const handleSubmit = async ({
    login,
    shareWith,
    sharePreviews,
  }: {
    login: LoginV1;
    shareWith: TShareRecipient[];
    sharePreviews: boolean;
  }) => {
    const prevShareIds = _.map(props.sharingWith, "id");
    const newShareIds = _.map(shareWith, "id");

    const newFriendShares = shareWith.filter(
      (u) => u.kind === "Friend" && !prevShareIds.includes(u.id)
    ) as IShareRecipientFriend[];
    const newInviteShares = shareWith.filter(
      (u) => u.kind === "Invite" && !prevShareIds.includes(u.id)
    ) as IShareRecipientInvite[];
    const revokedFriendShares = props.sharingWith.filter(
      (u) => u.kind === "Friend" && !newShareIds.includes(u.id)
    ) as IShareRecipientFriend[];
    const revokedInviteShares = props.sharingWith.filter(
      (u) => u.kind === "Invite" && !newShareIds.includes(u.id)
    ) as IShareRecipientInvite[];

    return props.onSave({
      login,
      newFriendShares,
      newInviteShares,
      revokedFriendShares,
      revokedInviteShares,
      sharePreviews,
    });
  };

  return (
    <EditLogin
      type={props.type}
      login={props.login}
      sharingWith={props.sharingWith}
      sharePreviews={props.sharePreviews}
      friends={props.friends}
      onSubmit={handleSubmit}
      showDelete
      onDelete={props.onDelete}
    />
  );
};

const AnimateText: React.FC<{ texts: React.ReactNode[]; every: number }> = ({
  texts,
  every,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index >= texts.length - 1) {
        setIndex(0);
      } else {
        setIndex(index + 1);
      }
    }, every);

    return () => {
      clearInterval(interval);
    };
  }, [every, index, texts]);

  return <>{texts[index]}</>;
};

export const ViewLogin: React.FC<
  TViewLogin & {
    loadPotentialShares: () => Promise<TShareRecipient[]>;
    updateLogin: (changes: ILoginUpdate) => Promise<any>;
    deleteLogin: () => Promise<any>;
    me: LoginMember;
    onMagicLinkUsage: (
      state: "activating" | "success" | "fail"
    ) => Promise<any>;
  }
> = (props) => {
  const { credentials } = props;
  const currentUserIsManager = props.manager.id === props.me.id;

  const [editing, setEditing] = useState(false);
  const [friends, setFriends] = useState<null | TShareRecipient[]>(null);
  const chromeEnv = useCurrentBrowserEnv();

  const [magicLinkActivationStatus, setMagicLinkActivationStatus] = useState<
    null | "activating" | "done" | "success" | "fail"
  >(null);

  const [
    extensionInstalled,
    recheckExtensionAvailability,
  ] = useExtensionAvailability();
  const [showInstallExtensionModal, setShowInstallExtensionModal] = useState(
    false
  );

  useEffect(() => {
    const loadFriends = async () =>
      setFriends(await props.loadPotentialShares());

    if (editing) {
      loadFriends();
    }
  }, [editing, props]);

  useEffect(() => {
    setEditing(false);
  }, [props.credentials]);

  const activateMagicLink = async () => {
    props.onMagicLinkUsage("activating");
    return chromeEnv.injectBrowserState(props.credentials);
  };

  if (editing)
    return (
      friends && (
        <UpdateLogin
          type={props.type}
          login={props.credentials}
          sharingWith={(props.members as TShareRecipient[]) || []}
          sharePreviews={(props as any).sharePreviews}
          friends={friends || []}
          onSave={async (changes) => props.updateLogin(changes)}
          onDelete={props.deleteLogin}
        />
      )
    );

  if (showInstallExtensionModal)
    return (
      <Modal onClose={() => setShowInstallExtensionModal(false)}>
        <ExtensionRequired
          explanationForInstall={`access ${possessive(
            props.manager.username
          )} ${props.credentials.info.title} account`}
          onReady={() => recheckExtensionAvailability()}
          onDismiss={() => setShowInstallExtensionModal(false)}
        >
          <Modal onClose={() => setShowInstallExtensionModal(false)}>
            <InfoCard
              floatingIcon={
                <FloatingIcon img={magicLinkHat} iconSize={82} size={107} />
              }
              title="Extension installed! 🎉"
            >
              <Text as="p" variant="info">
                You're a wizard, {props.me.username}! 🧙‍♀️
              </Text>
              <Text as="p" variant="info" pt={24}>
                Now you can create, share, and use{" "}
                <Text as="b" fontWeight="600">
                  magic links
                </Text>{" "}
                to share accounts without sharing passwords.
              </Text>

              <ExternalLinkBtn
                data-jam-analyze="magic-link/activate"
                variant="pink"
                fontSize={24}
                iconSize={21}
                mx="auto"
                mt={26}
                mb={20}
                onClick={async () => {
                  setShowInstallExtensionModal(false);
                  await activateMagicLink();
                }}
              >
                Activate magic link
              </ExternalLinkBtn>
            </InfoCard>
          </Modal>
        </ExtensionRequired>
      </Modal>
    );

  return (
    <>
      {magicLinkActivationStatus === "activating" && (
        <Modal onClose={() => setMagicLinkActivationStatus(null)}>
          <InfoCard
            floatingIcon={
              <FloatingIcon img={magicLinkHat} iconSize={82} size={107} />
            }
            title={
              <React.Fragment>
                <Text as="span" minWidth="50px" display="inline-block">
                  <AnimateText
                    texts={["💻🧙‍♂️", "✨🧙‍♂️", "💻🧙‍♂️", "💥🧙‍♂️"]}
                    every={600}
                  />
                </Text>
                Activating magic link
              </React.Fragment>
            }
          >
            <Text as="p" variant="info">
              Hang tight! We’re opening{" "}
              <strong>{props.credentials.info.title}</strong> in a new tab and
              recreating <strong>{possessive(props.manager.username)}</strong>{" "}
              session.
            </Text>
            <Text as="p" variant="info" pt={24} mb="4px" pb={0}>
              This should only take a few seconds.
            </Text>
          </InfoCard>
        </Modal>
      )}
      {magicLinkActivationStatus === "done" && (
        <Modal onClose={() => setMagicLinkActivationStatus(null)}>
          <InfoCard
            floatingIcon={
              <FloatingIcon img={magicLinkHat} iconSize={82} size={107} />
            }
            title="Done!"
          >
            <Text as="p" variant="info">
              We've recreated{" "}
              <strong>
                {possessive(props.manager.username)}{" "}
                {props.credentials.info.title}
              </strong>{" "}
              session in a new tab.
            </Text>
            <Text as="p" variant="info" pt={24} mb="4px" pb={0}>
              Take a look. Did it work?
            </Text>
            <Flex>
              <Btn
                data-jam-analyze="magic-link/activate/success"
                px={25}
                mt={20}
                variant="green"
                fontSize={18}
                block
                mb={0}
                disabled={_.isNull(extensionInstalled)}
                onClick={() => {
                  props.onMagicLinkUsage("success");
                  setMagicLinkActivationStatus("success");
                }}
              >
                Yes <Emoji>😍</Emoji>
              </Btn>
              <Btn
                data-jam-analyze="magic-link/activate/fail"
                ml={20}
                px={25}
                mt={20}
                variant="red"
                fontSize={18}
                block
                mb={0}
                onClick={() => {
                  props.onMagicLinkUsage("fail");
                  setMagicLinkActivationStatus("fail");
                }}
              >
                No <Emoji>😕</Emoji>
              </Btn>
            </Flex>
          </InfoCard>
        </Modal>
      )}
      {magicLinkActivationStatus === "success" && (
        <Modal onClose={() => setMagicLinkActivationStatus(null)}>
          <InfoCard
            floatingIcon={
              <FloatingIcon img={magicLinkHat} iconSize={82} size={107} />
            }
            title="Hurray! 🥳"
          >
            <Text as="p" variant="info">
              We're happy Jam could add a little magic to your day
            </Text>
            <Btn
              mt={20}
              variant="pink"
              fontSize={18}
              block
              onClick={() => setMagicLinkActivationStatus(null)}
            >
              Close
            </Btn>
          </InfoCard>
        </Modal>
      )}
      {magicLinkActivationStatus === "fail" && (
        <Modal onClose={() => setMagicLinkActivationStatus(null)}>
          <InfoCard
            floatingIcon={
              <FloatingIcon img={magicLinkHat} iconSize={82} size={107} />
            }
            title="Sorry!"
          >
            <Text as="p" variant="info">
              Magic links are a new experimental feature we’re working on. Sorry
              it didn’t work for you!
            </Text>
            <br />
            <Text as="p" variant="info">
              The magic link might not have worked because:
            </Text>
            <br />
            <Text as="ul" variant="info" ml={0} pl="20px">
              <li>Your friend may have signed out on their machine</li>
              <li>The service may not be compatible with magic links</li>
              <li>Jam might have a bug</li>
            </Text>
            <br />
            <Text as="p" variant="info">
              Sometimes, refreshing the service works. You could also try to
              apply the magic link with Jam again.
            </Text>
            <Btn
              mt={20}
              variant="blue"
              fontSize={18}
              block
              onClick={() => setMagicLinkActivationStatus(null)}
            >
              Dismiss
            </Btn>
          </InfoCard>
        </Modal>
      )}
      <Cards>
        {currentUserIsManager && (
          <Actions>
            <EditBtn
              data-jam-analyze="view-login/edit-btn"
              onClick={() => setEditing(true)}
              size={35}
            />
          </Actions>
        )}
        <Card wide verticalPadding={30}>
          {currentUserIsManager ? (
            <LoginDescription
              kind="mine"
              userAvatarUrl={props.manager.avatarUrl}
              loginTitle={credentials.info.title}
              loginDomain={credentials.info.domain}
            />
          ) : (
            <LoginDescription
              kind="shared"
              friendUsername={props.manager.username}
              friendAvatarUrl={props.manager.avatarUrl}
              loginTitle={credentials.info.title}
              loginDomain={credentials.info.domain}
            />
          )}
        </Card>
        {props.type === "raw_credentials" ? (
          <Card wide flush label="credentials" verticalPadding={0}>
            <LoginDetailStatic
              kind="username"
              type="text"
              name="username"
              value={credentials.secret.rawCredentials?.username}
            />
            <LoginDetailStaticPassword
              kind="password"
              type="password"
              name="password"
              value={credentials.secret.rawCredentials?.password}
            />
          </Card>
        ) : (
          <Card wide verticalPadding={0}>
            <Box my="25px">
              <Text
                color="textInfo"
                fontWeight="bold"
                fontSize="20px"
                textAlign="center"
              >
                Magic Link ✨
              </Text>
              <Text
                variant="detail"
                fontSize="16px"
                textAlign="center"
                mt={20}
                sx={{ lineHeight: "21px" }}
              >
                {props.manager.username} shared their account with Jam’s browser
                extension. No passwords required!
              </Text>
              <ExternalLinkBtn
                data-jam-analyze="magic-link/activate"
                as="button"
                variant="pink"
                fontSize={18}
                iconSize={16}
                display="block"
                mx="auto"
                mt={20}
                disabled={_.isNull(extensionInstalled)}
                onClick={async () => {
                  if (_.isNull(extensionInstalled)) return;

                  if (extensionInstalled) {
                    setMagicLinkActivationStatus("activating");
                    await activateMagicLink();
                    setMagicLinkActivationStatus("done");
                  } else {
                    setShowInstallExtensionModal(true);
                  }
                }}
              >
                Activate magic link!
              </ExternalLinkBtn>
            </Box>
          </Card>
        )}

        {credentials.detail.note && (
          <Card wide label="notes" verticalPadding={40}>
            <LoginNote>{credentials.detail.note}</LoginNote>
          </Card>
        )}
        <Card wide label="sharing with" flush verticalPadding={35}>
          <Grid>
            {((props?.members || []) as TLoginMember[]).map(
              (member: TLoginMember, i: number) => (
                <LoginMember {...member} key={i} />
              )
            )}
            {currentUserIsManager && (
              <InviteFriend linkTo={`/login/${props.id}/invite`} />
            )}
          </Grid>
        </Card>
      </Cards>
    </>
  );
};

export const LoadLogin: React.FC<{ id: string; app: LoadedApp }> = (props) => {
  const [login, setLogin] = useState<TViewLogin | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const { crypto, currentUser } = props.app.state;

  const loadLogin = async () => {
    const outcome = await props.app.api().getLogin(props.id);

    if (outcome.kind !== "Success") {
      setNotFound(true);
      return;
    }

    const loginData = outcome.data;

    const decrypted = await crypto.decryptVersionedSharedLoginCredentials(
      loginData.schemaVersion,
      loginData.credentials,
      {
        encryptedDataKey: loginData.credentialsKey,
        privKey: currentUser.privateKey,
      }
    );

    setLogin({ ...loginData, credentials: decrypted });
  };

  useEffect(() => {
    loadLogin();
  }, []);

  if (notFound) return <NotFound />;

  if (login === null) return <LoadingPage />;

  if (isDeleted) {
    return (
      <WithFlash message="Login deleted!" kind="success">
        <Redirect to="/" />
      </WithFlash>
    );
  }

  return (
    <ViewLogin
      {...login}
      me={_.pick(props.app.state.currentUser, ["id", "avatarUrl", "username"])}
      loadPotentialShares={async () => props.app.api().getPotentialShares()}
      updateLogin={async (changes) => {
        await props.app.api().updateLoginData(props.id, changes);
        await loadLogin();
      }}
      deleteLogin={async () => {
        await props.app.api().deleteLogin(props.id);
        setIsDeleted(true);
      }}
      onMagicLinkUsage={async (state: "activating" | "success" | "fail") => {
        await props.app.api().recordMagicLinkUsage(props.id, state);
      }}
    />
  );
};
