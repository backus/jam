import * as React from "react";
import addFriendsVectors from "./../img/addFriendsCardVectors.png";
import addLoginVectors from "./../img/addLoginCardVector.png";
import styled from "styled-components/macro";
import { useSpring, animated } from "react-spring";
import { Link } from "react-router-dom";

const ActionCardText = styled.span`
  display: flex;
  justify-content: center;
  align-items: flex-end;

  font-weight: bold;
  font-size: 30px;
  @media (max-width: 375px) {
    font-size: 26px;
  }
  @media (max-width: 320px) {
    font-size: 22px;
  }
  color: #ffffff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.25);

  text-decoration: none;
  position: absolute;
  bottom: 10%;
  width: 100%;
`;

// const ActionCard = styled.div`
const ActionCard = styled(animated(Link))`
  padding-bottom: 20px;
  width: 45%;
  height: 0px;
  padding-top: 29%;
  cursor: pointer;
  border-radius: 10px;
  transition: box-shadow 0.5s;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 6px 6px 15px rgba(0, 0, 0, 0.2);
  }

  margin-bottom: 25px;
  text-decoration: none;
`;

const AddFriendsAction = styled(ActionCard)`
  background: url(${addFriendsVectors}),
    radial-gradient(
      127.54% 127.54% at 65.28% 146.38%,
      #ff16da 1.2%,
      rgba(255, 255, 255, 0) 100%
    ),
    linear-gradient(207.81deg, #ffc700 11.38%, #fe9800 101.27%);
  background-position: left;
`;

const AddLoginAction = styled(ActionCard)`
  background: url(${addLoginVectors}),
    linear-gradient(180deg, #f56ff8 0%, #cc72f6 100%);
  background-position: left;
`;

const calc = (x: number, y: number) => [
  -(y - window.innerHeight / 2) / 20,
  (x - window.innerWidth / 2) / 20,
  1.1,
];
const trans = (x: number, y: number, s: number) =>
  `perspective(250px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

export const AddFriendCard: React.FC<any & { to: string }> = (props) => {
  const [springProps, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 4, tension: 400, friction: 90 },
  }));
  return (
    <AddFriendsAction
      data-jam-analyze="add-friends-card"
      to={props.to}
      onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
      onMouseLeave={() => set({ xys: [0, 0, 1] })}
      style={{ transform: springProps.xys.interpolate(trans as any) }}
      {...props}
    >
      <ActionCardText>add friends</ActionCardText>
    </AddFriendsAction>
  );
};

export const AddLoginCard: React.FC<any & { to: string }> = (props) => {
  const [springProps, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 4, tension: 400, friction: 90 },
  }));
  return (
    <AddLoginAction
      data-jam-analyze="add-login-card"
      to={props.to}
      onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
      onMouseLeave={() => set({ xys: [0, 0, 1] })}
      style={{ transform: springProps.xys.interpolate(trans as any) }}
      {...props}
    >
      <ActionCardText>add login</ActionCardText>
    </AddLoginAction>
  );
};
