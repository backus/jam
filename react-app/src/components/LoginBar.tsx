import React from "react";
import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components/macro";
import { assertNever } from "../assertNever";
import { possessive } from "../utils";
import clientEnv from "./../clientEnv";
import { Avatar } from "../Avatar";
import { Box } from "rebass/styled-components";

const defaultColors = [
  "#E776B3",
  "#769CE7",
  "#76E7A3",
  "#F3AE6E",
  "#F36E6E",
  "#F36EEE",
  "#D01D1D",
  "#20D01D",
  "#2B1DD0",
  "#CDD01D",
];

const randomColorBy = (letter: string) =>
  defaultColors[letter.charCodeAt(0) % defaultColors.length];

const LoginIcon = styled.span<{ loginTitle?: string }>`
  height: 55px;
  width: 55px;
  margin-left: -2px;

  /* Make broken images display the first letter of title */
  &::before {
    content: "${(props) => (props.loginTitle || "?")[0]}";
  }

  font-size: 32px;
  background: ${(props) => randomColorBy((props.loginTitle || "?")[0])};
  color: white;
  font-weight: 900;
  width: 55px;
  height: 55px;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  display: flex;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.25);
`;

const TitleText = styled.span`
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
`;

const Bar = styled.div`
  box-shadow: 1px 2px 0px rgba(0, 0, 0, 0.1);
  border-radius: 10px;

  color: #424242;

  background: #ffffff;

  display: flex;
  align-items: center;

  overflow: hidden;
  position: relative;

  cursor: pointer;
  text-decoration: none;

  &:hover {
    transform: scale(1.05);
    transition: transform 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);
  }
`;

const LoginTitle = styled.div`
  height: 24px;
  display: flex;
  margin-top: 5px;
  vertical-align: text-top;
`;

const UserIcon = ({ img }: { img: string }) => (
  <Avatar
    uri={img}
    circle
    size="40px"
    sx={{
      right: 0,
      position: "absolute",
      boxShadow: "0px 4px 3px rgba(0, 0, 0, 0.05)",
      border: "1px solid #FFECB3",
    }}
  />
);

const Desc = styled.div`
  padding: 0;
  margin: 0;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  height: 55px;
  position: relative;
  width: calc(100% - (55px + 20px + 100px));
`;

const ManagementDesc = styled.div`
  height: 20px;
  font-size: 14px;
  color: rgba(85, 90, 96, 0.55);
  font-style: italic;
  margin-top: 4px;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
`;

const Link = styled(RouterLink)`
  text-decoration: none;
`;

const NewLabel = styled.span`
  font-style: italic;
  font-weight: bold;
  color: white;
  font-size: 14px;
  background: #f1306a;
  border: 1px solid #f1306a;
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: 10px;
`;

interface CommonLoginBarProps {
  title: string;
  new?: boolean;
  uri: string;
  className?: string;
  style?: any;
}

interface Mine extends CommonLoginBarProps {
  kind: "mine";
  userAvatarUrl: string;
}

interface Shared extends CommonLoginBarProps {
  kind: "shared";
  friendAvatarUrl: string;
  friendUsername: string;
  userAvatarUrl: string;
}

interface Preview extends CommonLoginBarProps {
  kind: "preview";
  friendAvatarUrl: string;
  friendUsername: string;
}

type LoginBarProps = Mine | Shared | Preview;

export const LoginBar: React.FC<LoginBarProps> = (props) => {
  let desc: string;
  switch (props.kind) {
    case "mine":
      desc = "You manage this account";
      break;
    case "shared":
      desc = `${props.friendUsername} is sharing this with you`;
      break;
    case "preview":
      desc = `${possessive(props.friendUsername)} account`;
      break;
    default:
      return assertNever();
  }
  return (
    <Link
      data-jam-analyze={`login-bar/${props.kind}`}
      to={props.uri}
      className={props.className}
    >
      <Bar>
        <LoginIcon loginTitle={props.title} />
        <Desc>
          <LoginTitle>
            <TitleText>{props.title}</TitleText>{" "}
            {props.new && <NewLabel>new</NewLabel>}
          </LoginTitle>
          <ManagementDesc>{desc}</ManagementDesc>
        </Desc>
        <Box
          height="40px"
          width="80px"
          sx={{
            position: "absolute",
            right: "20px",
            "& > :nth-child(2)": { right: "35px" },
          }}
        >
          {props.kind !== "preview" && <UserIcon img={props.userAvatarUrl} />}
          {props.kind !== "mine" && <UserIcon img={props.friendAvatarUrl} />}
        </Box>
      </Bar>
    </Link>
  );
};
