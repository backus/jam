import React from "react";
import styled from "styled-components/macro";
import { Emoji } from "./Emoji";

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 48px;
  width: 100%;

  & > ${Emoji} {
    font-size: 48px;
    margin-right: 10px;
    margin-left: -10px;
  }

  & > h1 {
    font-weight: 900;
    font-size: 18px;
    margin-top: 20px;
    text-align: center;

    color: #555a60;
  }

  margin-bottom: 30px;
`;

export const Body = styled.div`
  font-size: 16px;
  line-height: 24px;
  width: 100%;
  max-width: 300px;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  margin-bottom: 24px;

  color: #696d74;
`;
