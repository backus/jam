import * as React from "react";
import * as _ from "lodash";
import styled, { keyframes, css } from "styled-components/macro";
import bellIcon from "./../img/bell.svg";
import { Link } from "react-router-dom";
import { LoadedApp } from "../AppContainer";

const ringBell = keyframes`
0% { transform: rotate(0); }
1% { transform: rotate(30deg); }
3% { transform: rotate(-28deg); }
5% { transform: rotate(34deg); }
7% { transform: rotate(-32deg); }
9% { transform: rotate(30deg); }
11% { transform: rotate(-28deg); }
13% { transform: rotate(26deg); }
15% { transform: rotate(-24deg); }
17% { transform: rotate(22deg); }
19% { transform: rotate(-20deg); }
21% { transform: rotate(18deg); }
23% { transform: rotate(-16deg); }
25% { transform: rotate(14deg); }
27% { transform: rotate(-12deg); }
29% { transform: rotate(10deg); }
31% { transform: rotate(-8deg); }
33% { transform: rotate(6deg); }
35% { transform: rotate(-4deg); }
37% { transform: rotate(2deg); }
39% { transform: rotate(-1deg); }
41% { transform: rotate(1deg); }

43% { transform: rotate(0); }
100% { transform: rotate(0); }
`;

const NotificationsBell = styled.div<{ show: boolean }>`
  height: 32px;
  width: 32px;
  background: url(${bellIcon});
  background-repeat: no-repeat;
  background-size: 26.5px 32px;
  position: relative;
  right: 0;
  top: 0;

  ${(props) =>
    props.show
      ? css`
          animation: ${ringBell} 4s 0.7s ease-in-out 1;

          &:hover {
            cursor: pointer;
            animation: ${ringBell} 4s 0.7s ease-in-out infinite;
          }
        `
      : css`
          display: none;
        `}
`;

const NotifCount = styled.span`
  position: absolute;
  top: -5px;
  right: 0;
  width: 17px;
  height: 17px;
  line-height: 17px;
  border-radius: 50px;
  background: red;
  font-size: 12px;
  font-weight: 500;
  color: white;
  text-align: center;
`;

export const Notifications: React.FC<{ count: number }> = ({ count }) => {
  return (
    <Link to="/notifications">
      <NotificationsBell show={count > 0}>
        {count > 0 ? <NotifCount>{count}</NotifCount> : ""}
      </NotificationsBell>
    </Link>
  );
};

export const LoadNotifications = ({ app }: { app: LoadedApp }) => {
  const [numNotifs, setNumNotifs] = React.useState(0);

  React.useEffect(() => {
    const getNotifCount = async () => {
      const result = await app.graphql().GetNotifications();
      const values: any[] = Object.values(result);

      setNumNotifs(_.sum(values.map((list) => list.length)));
    };
    getNotifCount();
  }, []);

  return <Notifications count={numNotifs} />;
};
