import * as React from "react";
import styled, { css } from "styled-components/macro";
import { Stranger } from "../api/graphql";
import { TShareRecipient, TLoginMember } from "./../api";
import inviteImg from "./../img/invite-friend.svg";
import { Link } from "react-router-dom";
import { NoImagePlaceholder as NoImagePlaceholderComponent } from "./NoImagePlaceholder";
import clientEnv from "../clientEnv";
import { Avatar } from "../Avatar";
import {
  Image,
  ImageProps,
  Link as RebassLink,
} from "rebass/styled-components";
import theme from "./../theme";

const NoImagePlaceholder = styled(NoImagePlaceholderComponent)``;

const Label = styled.span`
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: normal;
  text-align: center;
  text-decoration: none;

  color: #aab1bb;

  transition: color 0.15s ease;
`;

const Entry = styled.div`
  display: flex;
  flex-direction: column;
  width: 105px;
  margin: 0 auto 20px auto;

  & > ${NoImagePlaceholder} {
    margin-bottom: 16.5px;
    align-self: center;
  }
`;

const SelectableEntry = styled(Entry)<{ selected: boolean }>`
  cursor: pointer;

  ${NoImagePlaceholder} {
    border: 2.5px solid ${(props) => (props.selected ? "#56AFEF" : "#CFD5DB")};

    opacity: ${(props) => (props.selected ? 1 : 0.4)};

    transition: opacity 0.1s ease;
  }

  & > ${Label} {
    transition: color 0.1s ease;

    ${(props) =>
      props.selected &&
      css`
        color: #566377;
        font-weight: 600;
      `}
  }

  ${(props) =>
    !props.selected &&
    css`
      &:hover > ${NoImagePlaceholder} {
        opacity: 0.75;
        border: 2.5px solid #91c7ee;
      }

      &:hover > ${Label} {
        color: #808a99;
      }
    `}

  & ${NoImagePlaceholder} {
    margin-bottom: 16.5px;
    align-self: center;
  }
`;

export const SelectableLoginMember: React.FC<
  Pick<Stranger, "username" | "avatarUrl"> & {
    onClick: () => void;
    selected: boolean;
  }
> = (props) => (
  <SelectableEntry
    data-jam-analyze={`selectable-login-member/${
      props.selected ? "selected" : "unselected"
    }`}
    onClick={props.onClick}
    selected={props.selected}
  >
    {props.avatarUrl ? (
      <Avatar
        uri={props.avatarUrl}
        display="block"
        circle
        size="70px"
        mb="16.5px"
        alignSelf="center"
        opacity={props.selected ? 1 : 0.4}
        sx={{
          transition: "transform 0.25s ease",
          boxShadow: "0px 4px 3px rgba(0, 0, 0, 0.05)",
          border: `2px solid ${
            props.selected ? theme.colors.griflan.turquoise : "#CFD5DB"
          }`,
        }}
      />
    ) : (
      <NoImagePlaceholder text={props.username} size={70} />
    )}

    <Label>{props.username}</Label>
  </SelectableEntry>
);

export const LoginMember: React.FC<TLoginMember> = (props) => {
  const entry = (
    <Entry>
      {props.kind === "Invite" ? (
        <NoImagePlaceholder text={props.name} size={70} />
      ) : (
        <Avatar
          uri={props.avatarUrl}
          display="block"
          circle
          size="70px"
          mb="16.5px"
          alignSelf="center"
          sx={{
            transition: "transform 0.25s ease",
            boxShadow: "0px 4px 3px rgba(0, 0, 0, 0.05)",
          }}
        />
      )}
      <Label>{props.name}</Label>
    </Entry>
  );

  if (props.kind === "Invite") return entry;

  return (
    <RebassLink
      as={Link}
      alignSelf="center"
      // @ts-ignore
      to={{ pathname: `/friend/${props.id}`, state: { modal: true } }}
      sx={{
        textDecoration: "none",
        "&:hover img": {
          transform: "scale(1.1)",
          transition: "all 0.25s ease",
        },
        "&:hover span": {
          color: "#6a727d",
        },
      }}
    >
      {entry}
    </RebassLink>
  );
};

export const InviteFriend: React.FC<{ linkTo: string }> = (props) => (
  <RebassLink
    as={Link}
    // @ts-expect-error
    to={props.linkTo}
    data-jam-analyze="view-login/add-a-friend"
    sx={{
      cursor: "pointer",
      textDecoration: "none",
      "&:hover img": { transform: "scale(1.1)" },
      "&:hover span": { color: "#6a727d" },
    }}
  >
    <Entry>
      <Image
        width="70px"
        height="70px"
        src={inviteImg}
        sx={{ borderRadius: "50%", transition: "transform 0.25s ease" }}
        mb="16.5px"
        alignSelf="center"
      />
      <Label>Add a friend</Label>
    </Entry>
  </RebassLink>
);

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  flex-direction: row;
  flex-wrap: wrap;

  @media (max-width: 375px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
