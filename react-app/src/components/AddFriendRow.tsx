import React, { useState } from "react";
import styled, { css, keyframes } from "styled-components/macro";
import checkImg from "./../img/checkmark.svg";
import { glow } from "./glow";
import { NoImagePlaceholder } from "./NoImagePlaceholder";
import clientEnv from "./../clientEnv";
import { Btn, IconBtn } from "./Button";
import { Modal } from "./Modal";
import { ConfirmDelete } from "./ConfirmDelete";
import { possessive } from "../utils";
import { Box, Button } from "rebass/styled-components";
import { Avatar } from "../Avatar";
import { Link } from "react-router-dom";

type TSharingStatus = "not sharing" | "sending" | "sent";

const RowWrap = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 24px 0 24px;
`;

const FriendDescWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 23px;
  position: relative;
  flex-grow: 1;
  /* width: 100%; */
`;

const FriendName = styled.span`
  font-weight: bold;
  font-size: 16px;
  line-height: 16px;
  position: absolute;

  color: #555a60;
`;

const FriendDesc = styled.span`
  font-weight: normal;
  font-size: 12px;
  line-height: 14px;
  /* identical to box height */

  color: #acb5c1;

  position: absolute;
  bottom: 0;
`;

const AddInviteBtn = styled.button<{ status: TSharingStatus }>`
  border: 0;
  background: red;
  background: ${(props) => (props.status === "sent" ? "#24E34E" : "#f36f97")};
  border-radius: 10px;
  font-weight: 900;
  font-size: 14px;
  line-height: 40px;
  display: flex;
  align-items: center;
  text-align: center;
  text-transform: uppercase;

  color: #ffffff;
  padding: 0 20px 0 30px;
  position: relative;

  &::before {
    position: absolute;
    left: 10px;
    ${(props) =>
      props.status === "not sharing"
        ? css`
            content: "+";
          `
        : css`
            content: url(${checkImg});
          `};
    font-size: 18px;
    line-height: 40px;
  }

  ${(props) =>
    props.status === "not sharing" &&
    css`
      &:hover {
        background: #ff5084;
        cursor: pointer;
      }
    `}

  ${(props) =>
    props.status === "sending" &&
    css`
      animation: ${glow} 1.5s infinite;
    `}

  &:disabled {
    padding: 0 20px;
    &::before {
      left: 0;
      content: none;
    }
  }
`;

const FriendReqBtns = styled.div`
  width: 90px;
  /* flex-shrink: 1; */
  display: flex;

  position: relative;
`;

const RespondToFriendReqBtn = styled.span<{
  active: boolean;
  kind: "accept" | "reject";
}>`
  border: 0;
  background: ${(props) => (props.kind === "accept" ? "#24E34E" : "#E3245D")};
  border-radius: 8px;
  font-weight: 900;
  font-size: 16px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  text-transform: uppercase;
  display: block;

  color: #ffffff;
  height: 40px;
  line-height: 40px;
  width: 40px;
  position: absolute;
  padding: 0;
  /* padding-left: 5px; */

  &:first-child {
    left: 0;
  }

  &:last-child {
    right: 0;
  }

  ${(props) =>
    props.active
      ? css`
          width: 100%;
        `
      : css`
          cursor: pointer;
        `}
`;

const ViewInviteBtn = styled.button`
  border: 0;
  background: red;
  background: #f36f97;
  border-radius: 5px;
  font-weight: 900;
  font-size: 14px;
  line-height: 40px;
  display: flex;
  align-items: center;
  text-align: center;
  text-transform: uppercase;

  color: #ffffff;
  padding: 0 20px;
  position: relative;
  outline: none;

  &:hover {
    background: #ff5084;
    cursor: pointer;
  }
`;

export const UserList = styled.div`
  padding: 10px 0;

  & > * {
    margin-top: 28px;

    &:first-child {
      margin-top: 0;
    }
  }
`;

export const InvitedFriendRow = (props: {
  nickname: string;
  description: string;
  onView: () => void;
  onDelete: () => Promise<any>;
}) => {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  return (
    <RowWrap>
      <NoImagePlaceholder text={props.nickname} size={40} />
      <FriendDescWrap>
        <FriendName>{props.nickname}</FriendName>
        <FriendDesc>{props.description}</FriendDesc>
      </FriendDescWrap>
      <ViewInviteBtn
        data-jam-analyze="invited-friend/view"
        onClick={props.onView}
      >
        View
      </ViewInviteBtn>
      <IconBtn
        ml="15px"
        variant="red"
        icon="trash"
        size="40px"
        iconSize="14px"
        onClick={() => setConfirmDelete(true)}
      />
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)}>
          <Box maxWidth="400px">
            <ConfirmDelete
              onDelete={async () => {
                await props.onDelete();
                setConfirmDelete(false);
              }}
              onBack={() => setConfirmDelete(false)}
              title={
                <>
                  Are you sure you want to delete{" "}
                  <strong>{possessive(props.nickname)}</strong> invite?
                </>
              }
              body={
                <>
                  This will deactivate the invite link you created for{" "}
                  <strong>{props.nickname}</strong>. Any logins you shared with
                  them will be unshared.
                </>
              }
              deleteButtonText="Yes, delete the invite."
            />
          </Box>
        </Modal>
      )}
    </RowWrap>
  );
};

export const ViewFriendRow = (props: {
  id: string;
  username: string;
  avatarUrl: string;
  description: string;
}) => {
  return (
    <RowWrap>
      <Avatar circle size="40px" uri={props.avatarUrl} />
      <FriendDescWrap>
        <FriendName>{props.username}</FriendName>
        <FriendDesc>{props.description}</FriendDesc>
      </FriendDescWrap>
      <Button
        as={Link}
        // @ts-expect-error
        to={{ pathname: `/friend/${props.id}`, state: { modal: true } }}
        data-jam-analyze="friend/view"
        bg="#f36f97"
        px="20px"
        py="0"
        sx={{
          borderRadius: "5px",
          fontWeight: 900,
          fontSize: "14px",
          alignItems: "center",
          textAlign: "center",
          textTransform: "uppercase",
          lineHeight: "40px",
          "&:hover": {
            bg: "#ff5084",
          },
          outline: "none",
        }}
      >
        View
      </Button>
    </RowWrap>
  );
};

export const AddFriendRow = (props: {
  avatarUri?: string;
  name: string;
  description: string;
  onAdd: () => Promise<any>;
}) => {
  const [status, setStatus] = React.useState<TSharingStatus>("not sharing");

  let buttonText = "add";
  if (status === "sending") buttonText = "Sending";
  if (status === "sent") buttonText = "Done";

  return (
    <RowWrap>
      {props.avatarUri ? (
        <Avatar circle size="40px" uri={props.avatarUri} />
      ) : (
        <NoImagePlaceholder text={props.name} size={40} />
      )}
      <FriendDescWrap>
        <FriendName>{props.name}</FriendName>
        <FriendDesc>{props.description}</FriendDesc>
      </FriendDescWrap>
      <AddInviteBtn
        data-jam-analyze="find-friends/add-friend"
        disabled={status !== "not sharing"}
        status={status}
        onClick={async () => {
          setStatus("sending");
          await props.onAdd();
          setStatus("sent");
        }}
      >
        {buttonText}
      </AddInviteBtn>
    </RowWrap>
  );
};

export const RespondToFriendRequestRow = (props: {
  avatarUri: string;
  name: string;
  onAccept: () => Promise<any>;
  onReject: () => Promise<any>;
}) => {
  const [acceptText, setAcceptText] = React.useState("👍");
  const [rejectText, setRejectText] = React.useState("👎");
  const [showAccept, setShowAccept] = React.useState(true);
  const [showReject, setShowReject] = React.useState(true);

  return (
    <RowWrap>
      <Avatar circle size="40px" uri={props.avatarUri} />
      <FriendDescWrap>
        <FriendName>{props.name}</FriendName>
        <FriendDesc>Wants to be friends</FriendDesc>
      </FriendDescWrap>

      <FriendReqBtns>
        {showAccept && (
          <RespondToFriendReqBtn
            kind="accept"
            active={acceptText !== "👍"}
            onClick={async () => {
              setShowReject(false);
              setAcceptText("⏳");
              await props.onAccept();
              setAcceptText("✔");
            }}
          >
            {acceptText}
          </RespondToFriendReqBtn>
        )}
        {showReject && (
          <RespondToFriendReqBtn
            kind="reject"
            active={rejectText !== "👎"}
            onClick={async () => {
              setShowAccept(false);
              setRejectText("⏳");
              await props.onReject();
              setRejectText("✔");
            }}
          >
            {rejectText}
          </RespondToFriendReqBtn>
        )}
      </FriendReqBtns>
    </RowWrap>
  );
};

const PendingLabel = styled.div`
  background: #fac3d3;
  border-radius: 10px;
  font-weight: 900;
  font-size: 14px;
  line-height: 40px;
  align-items: center;
  text-align: center;
  text-transform: uppercase;

  color: #ffffff;
  padding: 0 10px;
`;

export const PendingFriendRequestRow = (props: {
  avatarUri: string;
  name: string;
}) => {
  return (
    <RowWrap>
      <Avatar circle size="40px" uri={props.avatarUri} />
      <FriendDescWrap>
        <FriendName>{props.name}</FriendName>
        <FriendDesc>Hasn't responded yet</FriendDesc>
      </FriendDescWrap>

      <PendingLabel>pending</PendingLabel>
    </RowWrap>
  );
};

const YourFriendLabel = styled.div`
  background: #8ff1a5;
  border-radius: 10px;
  font-weight: 900;
  font-size: 14px;
  line-height: 40px;
  align-items: center;
  text-align: center;
  text-transform: uppercase;

  color: #ffffff;
  padding: 0 10px;
  flex-shrink: 1;

  &:before {
    content: "your friend";

    @media screen and (max-width: 320px) {
      content: "friends";
    }
  }
`;

export const ExistingFriendRow = (props: {
  avatarUri: string;
  name: string;
  description: string;
}) => {
  return (
    <RowWrap>
      <Avatar circle size="40px" uri={props.avatarUri} />
      <FriendDescWrap>
        <FriendName>{props.name}</FriendName>
        <FriendDesc>{props.description}</FriendDesc>
      </FriendDescWrap>

      <YourFriendLabel />
    </RowWrap>
  );
};
