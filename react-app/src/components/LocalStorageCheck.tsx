import React from "react";

import { Card } from "./Card";
import { Body } from "./SimpleMessageCard";
import styled from "styled-components/macro";
import { Page } from "./Page";
import { Emoji } from "./Emoji";

const localStorageAvailable = () => {
  try {
    localStorage.setItem("@jam/storage-test", "42");
    return localStorage.getItem("@jam/storage-test") === "42";
  } catch (error) {
    return false;
  }
};

const CookiesHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 48px;

  & > ${Emoji} {
    font-size: 48px;
    margin-right: 10px;
    margin-left: -10px;
  }

  & > h1 {
    font-weight: 900;
    font-size: 18px;
    line-height: 48px;
    text-align: center;

    color: #555a60;
  }

  margin-bottom: 30px;
`;

export const LocalStorageCheck: React.FC = (props) => {
  return localStorageAvailable() ? (
    <>{props.children}</>
  ) : (
    <Page>
      <Card wide>
        <CookiesHeader>
          <Emoji>🍪</Emoji>
          <h1>Cookie?</h1>
        </CookiesHeader>
        <Body>Jam needs cookies to function. Can you please enable them?</Body>
      </Card>
    </Page>
  );
};
