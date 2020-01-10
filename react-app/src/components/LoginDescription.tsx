/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import styled, { css, keyframes } from "styled-components/macro";
import { LoadedApp } from "./../AppContainer";
import { Card } from "./Card";
import { LoginIcon } from "./LoginIcon";
import clientEnv from "./../clientEnv";
import { Avatar } from "../Avatar";

export const ViewLoginHeader = styled.div`
  display: flex;
`;

const ManagerAvatar = styled.div`
  img,
  picture {
    display: block;
    width: 50px;
    height: 50px;
    box-shadow: 0px 4px 3px rgba(0, 0, 0, 0.05);
    border-radius: 75px;
  }
`;

export const LoginOverview = styled.div`
  margin-left: 15px;
  flex-direction: column;
`;

export const LoginTitle = styled.div`
  font-size: 24px;
  line-height: 28px;
  font-weight: bold;

  color: #2c3c55;

  flex: none;
  order: 0;
  align-self: flex-start;
  width: 100%;
`;
const Desc = styled.div`
  display: flex;
  font-family: azo-sans-web, sans-serif;
  font-style: italic;
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;

  color: #6981a5;

  flex: none;
  order: 1;
  align-self: flex-start;
  margin-top: 5px;
`;

export const WebsiteIcon = styled.div`
  display: flex;
  margin-left: auto;
`;

type LoginDescriptionProps = {
  loginTitle: string;
  loginDomain: string | null;
} & (
  | { kind: "mine"; userAvatarUrl: string }
  | { kind: "shared"; friendAvatarUrl: string; friendUsername: string }
);

export const LoginDescription: React.FC<LoginDescriptionProps> = (props) => {
  return (
    <ViewLoginHeader>
      <ManagerAvatar>
        <Avatar
          circle
          size="50px"
          uri={
            props.kind === "mine" ? props.userAvatarUrl : props.friendAvatarUrl
          }
        />
      </ManagerAvatar>
      <LoginOverview>
        <LoginTitle>{props.loginTitle}</LoginTitle>
        <Desc>
          {props.kind === "mine"
            ? "You manage"
            : `${props.friendUsername} manages`}{" "}
          this account
        </Desc>
      </LoginOverview>
      <WebsiteIcon>
        <LoginIcon
          backgroundColor="white"
          loginTitle={props.loginTitle}
          size={55}
          circle
        />
      </WebsiteIcon>
    </ViewLoginHeader>
  );
};
