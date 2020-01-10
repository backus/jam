import React, { useState, useEffect, useRef } from "react";
import styled, { css } from "styled-components/macro";
import { Modal } from "./Modal";
import { useForm } from "react-hook-form";
import sendImg from "./../img/send-arrow.png";
import * as _ from "lodash";
import { SubmitBtn } from "./SubmitBtn";
import { SimpleCard } from "./Card";
import invitePresentIcon from "./../img/invite-present-icon.svg";
import CopyToClipboard from "react-copy-to-clipboard";
import { Btn, IconBtn } from "./Button";
import { FloatingIcon } from "./FloatingIcon";
import { formValidations, possessive } from "../utils";
import arrowImg from "./../img/create-arrow.svg";
import spinnerGif from "./../img/spinner.gif";
import copyIcon from "./../img/copy-icon.svg";
import checkmark from "./../img/checkmark.svg";
import { useKeyPress } from "../useKeyPress";
import { LoadedApp } from "../AppContainer";
import { Icon } from "./Icon";
import clientEnv from "../clientEnv";
const ClickToSelect = require("@mapbox/react-click-to-select").default;

const LinkField = styled.div`
  display: flex;
  flex-direction: row;
  height: 30px;
  margin: 30px 0;
`;

const LinkInput = styled.p<{ done: boolean }>`
  font-size: 14px;
  height: 60px;
  line-height: 30px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: calc(100% - 10px);

  /* Render a white gradient over the end of the text, hiding the ellipsis, and making
  it feel less like the invite URL is cut off from view because of a bug. */
  background: linear-gradient(
    270deg,
    white 0%,
    rgb(85, 90, 96, 0.5) 10%,
    #555a60 20%,
    #555a60 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  color: #555a60;
  outline: none;
  border: none;

  ${(props) =>
    props.done &&
    css`
      ::selection {
        background-color: #fef3d7;
      }
    `}
`;

const NicknameInput = styled.input``;

const Content = styled.div`
  padding: 0 37px;
  margin: 0;
  max-width: 375px;

  font-size: 18px;
  line-height: 24px;
  color: #696d74;
  line-height: 1.53;

  & > h3 {
    font-size: 21px;
    font-weight: bold;
    text-align: center;
    color: #696d74;
    margin: 17px 0 23px 0;
  }

  & p {
    padding: 0;
    margin: 0;
    margin-bottom: 20px;
  }

  & form {
    margin: 28px 0 24px 0;
    height: 45px;
    display: flex;
    color: #83868b;

    & ${NicknameInput} {
      flex-grow: 1;
      font-size: 26.25px;
      width: calc(100% - 11px - 45px);
      padding: 0 10px;
      margin-right: 11px;
      border: 2.5px solid #f3f2f9;
      box-sizing: border-box;
      border-radius: 5px;
      height: 100%;
      outline: none;
      color: #83868b;
      caret-color: #83868b;

      &::placeholder {
        color: #d4d5d6;
      }
    }
  }
`;

const PromptNickname: React.FC<{
  setNickname: (nickname: string) => Promise<any>;
}> = (props) => {
  const nicknameRef = React.createRef<HTMLInputElement>();
  const { register, handleSubmit, errors, formState } = useForm<{
    nickname: string;
  }>({
    mode: "onChange",
  });

  return (
    <Content>
      <h3>What is your friend's first name?</h3>
      <p>
        You can share logins with friends <u>before they accept your invite</u>.
        When you do, we’ll show you this name.
      </p>
      <form
        onSubmit={handleSubmit(({ nickname }) => props.setNickname(nickname))}
      >
        <NicknameInput
          data-jam-analyze="invite-friend-modal/nickname"
          ref={(inputRef) => {
            register({
              validate: (value) => formValidations.notBlank(value),
            })(inputRef);
            (nicknameRef as any).current = inputRef;
          }}
          maxLength={15}
          autoFocus
          type="text"
          name="nickname"
          placeholder="John"
          disabled={formState.isSubmitting}
        />
        <IconBtn
          variant="pink"
          data-jam-analyze="invite-friend-modal/create"
          disabled={!formState.dirty || !!errors.nickname}
          width="45px"
          height="45px"
          icon={formState.isSubmitting ? "spinner.white" : "next"}
          iconSize="15px"
        />
      </form>
    </Content>
  );
};

const NoOverflow = styled.div`
  overflow: hidden;
`;

export const PresentInviteLink: React.FC<{
  nickname: string;
  link: string;
}> = (props) => {
  const [done, setDone] = React.useState(false);
  const linkRef = React.createRef<HTMLParagraphElement>();

  const selectText = () => {
    if (!linkRef.current) return;

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(linkRef.current);
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  useEffect(() => {
    selectText();
  }, [linkRef.current]);

  return (
    <Content>
      <h3>Woohoo! 🥳</h3>

      <p>
        This is <b>{possessive(props.nickname)}</b> invite.{" "}
        <u>Don't share it with anyone else!</u>
      </p>
      <p>
        When {props.nickname} accepts your invite, they'll have instant access
        to anything you've shared with them.
      </p>

      <LinkField>
        <NoOverflow>
          <ClickToSelect containerElement="span">
            <LinkInput ref={linkRef} done={done}>
              {props.link}
            </LinkInput>
          </ClickToSelect>
        </NoOverflow>
        <CopyToClipboard
          text={props.link}
          onCopy={() => {
            selectText();
            setDone(true);
          }}
        >
          <IconBtn
            variant={done ? "green" : "pink"}
            icon={done ? "checkmark" : "copy"}
            iconSize="15px"
            display="block"
            height="30px"
            px="15px"
          />
        </CopyToClipboard>
      </LinkField>
    </Content>
  );
};

const PromptNicknameModal: React.FC<{
  setNickname: (name: string) => Promise<void>;
  onClose: () => void;
}> = (props) => (
  <Modal onClose={props.onClose}>
    <SimpleCard>
      <FloatingIcon img={invitePresentIcon} iconSize={50} />
      <PromptNickname setNickname={props.setNickname} />
    </SimpleCard>
  </Modal>
);

export const PresentInviteLinkModal: React.FC<{
  onClose: () => void;
  nickname: string;
  link: string;
}> = (props) => (
  <Modal onClose={props.onClose}>
    <SimpleCard>
      <FloatingIcon img={invitePresentIcon} iconSize={50} />
      <PresentInviteLink {...props} />
    </SimpleCard>
  </Modal>
);

export const InviteModal: React.FC<{
  createInvite: (nickname: string) => Promise<string>;
  onClose: () => void;
}> = (props) => {
  const [nickname, setNickname] = useState<null | string>(null);
  const [inviteLink, setInviteLink] = useState<null | string>(null);
  const escapePress = useKeyPress("Escape");
  if (escapePress) props.onClose();

  const linkRef = React.createRef<HTMLInputElement>();

  const selectText = (inputRef: React.RefObject<HTMLInputElement>) => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  useEffect(() => {
    selectText(linkRef);
  }, [linkRef.current]);

  if (nickname && inviteLink) {
    return (
      <PresentInviteLinkModal
        onClose={props.onClose}
        nickname={nickname}
        link={inviteLink}
      />
    );
  } else {
    return (
      <PromptNicknameModal
        setNickname={async (name) => {
          setNickname(name);
          return setInviteLink(await props.createInvite(name));
        }}
        onClose={props.onClose}
      />
    );
  }
};

export const CreateInviteModal: React.FC<{
  app: LoadedApp;
  onClose: () => any;
}> = (props) => {
  const createInvite = async (nickname: string) => {
    const { id, linkKey } = await props.app.api().createInvite({
      nickname,
      phone: null,
      email: null,
    });

    const url = clientEnv.absolutePath(`/invite/${id}#${linkKey}`);

    props.app.syncLoginAccessKeys();

    return url.toString();
  };
  return <InviteModal createInvite={createInvite} onClose={props.onClose} />;
};
