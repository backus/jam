/* tslint:disable:styled-plugin */
import React, { useState } from "react";

import * as _ from "lodash";
import { Stranger, Maybe } from "./../api/graphql";
import styled, { css, keyframes } from "styled-components/macro";
import usernameImg from "../img/username-icon.png";
import passwordImg from "../img/password-icon.png";
import domainImg from "../img/domain-icon.png";
import CopyToClipboard from "react-copy-to-clipboard";

const icons = {
  username: usernameImg,
  password: passwordImg,
  domain: domainImg,
};

type InputTypes = keyof typeof icons;

type LoginMember = Pick<Stranger, "id" | "username">;

const PublicImg = (props: { name: string; alt: string }) => (
  <img src={`/img/${props.name}.png`} alt={props.alt} />
);

const Member = styled.div`
  display: flex;
  flex-direction: column;
  width: 75px;
  margin-right: 58px;
  margin-bottom: 20px;

  & img {
    display: block;
    width: 70px;
    height: 70px;
    box-shadow: 0px 4px 3px rgba(0, 0, 0, 0.05);
    border-radius: 75px;
    margin-bottom: 16.5px;
  }
`;

const MemberName = styled.span`
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: normal;
  line-height: 16px;
  text-align: center;

  color: rgba(44, 60, 85, 0.4);
`;

export const LoginField = styled.div`
  display: flex;
  flex-direction: row;

  padding: 20px 0;

  border-bottom: 0.5px solid #ccc;

  &:first-child {
    /* padding-top: 0; */
    border-radius: 10px 10px 0 0;
  }

  &:last-child {
    border-bottom: 0;
    /* padding-bottom: 0; */
    border-radius: 0 0 10px 10px;
  }
`;

const LoginIcon = styled.div<{ kind: InputTypes }>`
  height: 40px;
  width: 40px;
  background-image: url(${(props) => icons[props.kind]});
  background-size: contain;
  background-repeat: no-repeat;
`;

const StaticDisplay = styled.span<{ kind: InputTypes | "text" }>`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;
  color: #333333;

  ${(props) =>
    props.kind === "password" &&
    css`
      visibility: hidden;
      position: relative;

      &:after {
        visibility: visible;
        position: absolute;
        left: 5px;
        font-size: 16px;
        content: "••••••••••";
      }
    `}
`;

const LabeledInput = styled.div`
  width: 100%;
  position: relative;

  & input {
    position: absolute;
    left: 5px;
    top: 5px;
    height: 40px;
    padding-left: 5px;
    border: 0;
    /* background-color: lightblue; */

    border: none;
    outline: none;
    vertical-align: baseline;

    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    color: #333333;
  }

  & ${StaticDisplay} {
    position: absolute;
    left: 5px;
    bottom: 5px;
    height: 16px;
    padding-left: 5px;
    border: 0;
    /* background-color: lightblue; */

    border: none;
    outline: none;
    vertical-align: baseline;

    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    color: #333333;
  }

  & label {
    position: absolute;
    left: 10px;
    top: 0px;
    height: 30px;
    padding: 0;
    border: 0;
    /* background-color: lightblue; */

    z-index: 1;

    border: none;
    font-size: 12px;
    outline: none;
    vertical-align: baseline;

    font-style: normal;
    font-weight: bold;
    line-height: 12px;
    /* identical to box height */

    font-variant: small-caps;

    color: rgba(44, 60, 85, 0.4);
    user-select: none;
  }
`;

const inputInvalidAnim = keyframes`{
  from {
    background: white;
  }

  10% {
    box-shadow: 0 0 10px rgba(243, 60, 60, 1);
    border-color: rgba(243, 60, 60, 1);
    background: rgba(243, 60, 60, 0.75);
  }

  to {
    background: white;
  }
}`;

const Input = styled.input`
  ${(props: { error?: string }) =>
    props.error
      ? css`
          animation: ${inputInvalidAnim} 2s;
          animation-iteration-count: 1;
        `
      : ""}
`;

const NewLoginField = styled(LoginField)`
  &:first-child {
    padding-top: 0;
    border-radius: 10px 10px 0 0;
  }

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
    border-radius: 0 0 10px 10px;
  }
`;

export const LoginDetail = (props: {
  name: string;
  type: string;
  value: any;
  placeholder?: any;
  onChange?: () => void;
  kind: InputTypes;
  error?: string | undefined;
  autoFocus?: boolean;
  "data-jam-analyze"?: string;
}) => {
  return (
    <NewLoginField>
      <LoginIcon kind={props.kind} />
      <LabeledInput>
        <label htmlFor={props.name}>{props.name}</label>
        <input
          data-jam-analyze={props["data-jam-analyze"]}
          autoCapitalize="off"
          autoFocus={props.autoFocus}
          type={props.type}
          name={props.name}
          value={props.value}
          placeholder={props.placeholder}
          onChange={props.onChange}
        />
      </LabeledInput>
    </NewLoginField>
  );
};

const ActionText = styled.span`
  text-transform: uppercase;
  color: #acb5c1;
  font-weight: bold;
  font-size: 14px;
  height: 80px;
  line-height: 80px;
  position: absolute;
  right: 20px;
  top: 0;
  visibility: hidden;
  user-select: none;
`;

const StaticField = styled(LoginField)<{ copied: boolean }>`
  position: relative;
  padding: 20px 25px;

  transition: background-color 0.4s ease;
  background-color: white;

  &:first-child {
    padding-top: 20px;
  }

  &:last-child {
    padding-bottom: 20px;
  }

  &:hover {
    background-color: ${(props) => (props.copied ? "#fef3d7" : "#d7e5fe")};
    cursor: pointer;

    & > ${ActionText} {
      visibility: initial;
    }
  }

  ${(props) =>
    props.copied &&
    css`
      background-color: #fef3d7;
    `}
`;

const FakeField = styled(LoginField)`
  position: relative;
  padding: 20px 25px;

  transition: background-color 0.4s ease;

  &:first-child {
    padding-top: 20px;
  }

  &:last-child {
    padding-bottom: 20px;
  }
`;

export const LoginDetailStatic = (props: {
  name: string;
  value: any;
  placeholder?: any;
  onChange?: () => void;
  type: string;
  kind: InputTypes;
  error?: string | undefined;
  autoFocus?: boolean;
}) => {
  const [justCopied, setJustCopied] = React.useState(false);

  return (
    <CopyToClipboard
      data-jam-analyze={`login-detail/${props.kind}/copy`}
      text={props.value}
      onCopy={() => setJustCopied(true)}
    >
      <StaticField
        copied={justCopied}
        onMouseLeave={() => setJustCopied(false)}
      >
        <LoginIcon kind={props.kind} />
        <LabeledInput>
          <label htmlFor={props.name}>{props.name}</label>
          <StaticDisplay kind={props.kind}>{props.value}</StaticDisplay>
        </LabeledInput>
        <ActionText>{justCopied ? "copied!" : "copy"}</ActionText>
      </StaticField>
    </CopyToClipboard>
  );
};

const CopySection = styled.div<{ copied: boolean }>`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  padding: 20px 25px;
  margin: 0;
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.copied ? "#fef3d7" : "#d7e5fe")};

    & > ${ActionText} {
      visibility: initial;
    }
    border-right: 0.5px solid #ccc;
  }
`;

const ShowSection = styled.div`
  width: 100px;
  position: relative;
  text-align: center;
  align-items: center;
  justify-content: middle;
  cursor: pointer;
  & > ${ActionText} {
    position: unset;
  }
  &:hover {
    background-color: #d5e5fd;
  }
`;

const StaticFieldPassword = styled(LoginField)`
  padding: 0px;
  padding-bottom: 0px;
  height: 100%;
  background-color: white;

  &:hover {
    background-color: #ebf2fe;
  }

  &:last-child {
    padding: 0px;
  }

  overflow: hidden;

  &:hover ${ActionText} {
    visibility: initial;
  }
`;

export const LoginDetailStaticPassword = (props: {
  name: string;
  value: any;
  placeholder?: any;
  onChange?: () => void;
  type: string;
  kind: InputTypes;
  error?: string | undefined;
  autoFocus?: boolean;
}) => {
  const [justCopied, setJustCopied] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <StaticFieldPassword onMouseLeave={() => setJustCopied(false)}>
      <CopyToClipboard
        data-jam-analyze={`login-detail/${props.kind}/copy`}
        text={props.value}
        onCopy={() => setJustCopied(true)}
      >
        <CopySection copied={justCopied}>
          <LoginIcon kind={props.kind} />
          <LabeledInput>
            <label htmlFor={props.name}>{props.name}</label>
            <StaticDisplay kind={showPassword ? "text" : props.kind}>
              {props.value}
            </StaticDisplay>
          </LabeledInput>
          <ActionText>{justCopied ? "copied!" : "copy"}</ActionText>
        </CopySection>
      </CopyToClipboard>
      <ShowSection
        data-jam-analyze={`login-detail/${props.kind}/${
          showPassword ? "hide" : "show"
        }`}
        onClick={() => setShowPassword(!showPassword)}
      >
        <ActionText>{showPassword ? "hide" : "show"}</ActionText>
      </ShowSection>
    </StaticFieldPassword>
  );
};

export const LoginDetailFake = (props: {
  name: string;
  value: any;
  placeholder?: any;
  onChange?: () => void;
  type: string;
  kind: InputTypes;
  error?: string | undefined;
  autoFocus?: boolean;
}) => {
  return (
    <FakeField>
      <LoginIcon kind={props.kind} />
      <LabeledInput>
        <label htmlFor={props.name}>{props.name}</label>
        <StaticDisplay kind={props.kind}>{props.value}</StaticDisplay>
      </LabeledInput>
    </FakeField>
  );
};
