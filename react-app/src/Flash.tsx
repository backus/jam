/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components/macro";
import closeImg from "./img/close-button.svg";
import * as _ from "lodash";
import * as R from "ramda";
import uuid from "uuid/v4";

interface IFlashMessage {
  id: string;
  kind: "error" | "success" | "info";
  message: string;
}

type NewFlash = Pick<IFlashMessage, "kind" | "message">;

type FlashType = IFlashMessage["kind"];

const stylingMap = {
  error: { color: "#F1363C", emoji: "😰" },
  success: { color: "#09D068", emoji: "🎉" },
  info: { color: "#D6CE11", emoji: "☝" },
};

const FlashMessage = styled.div<{ kind: FlashType; visible: boolean }>`
  background: ${(props) => stylingMap[props.kind].color};
  border-radius: 10px;
  font-size: 18px;
  font-weight: 500;
  width: 95%;
  padding-left: 5%;
  margin-bottom: 20px;
  height: 59px;
  line-height: 59px;
  color: white;
  position: relative;

  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.25);

  &::before {
    content: "${(props) => stylingMap[props.kind].emoji}";
    margin-right: 10px;
  }

  ${(props) =>
    !props.visible &&
    css`
    opacity 0;
    height: 0;
    margin-bottom: 0;
    transition: margin-bottom 0.5s 0.5s, height 0.5s 0.5s, opacity 0.5s;
    `}
`;

const CloseButton = styled.button`
  outline: none;
  height: 59px;
  width: 50px;
  background: url(${closeImg});
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
  right: 0;
  top: 0;
  border: none;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
`;

const flashKey = "@jam/flash";

const readFlash = (): IFlashMessage[] => {
  const value = sessionStorage.getItem(flashKey) || "[]";
  const data = JSON.parse(value);
  if (!_.isArray(data) || !_.every(data, (value) => _.isObject(value)))
    throw new Error("Invalid flash");

  return data;
};

const setFlash = (messages: IFlashMessage[]) => {
  sessionStorage.setItem(flashKey, JSON.stringify(messages));
};

export const addFlash = (message: NewFlash) => {
  const entry = { ...message, id: uuid() };
  setFlash(readFlash().concat(entry));
};

export const WithFlash: React.FC<NewFlash> = (props) => {
  addFlash(_.pick(props, ["message", "kind"]));

  return <>{props.children}</>;
};

const Flash: React.FC<
  IFlashMessage & {
    visible: boolean;
    onClose: () => void;
  }
> = (props) => {
  return (
    <FlashMessage kind={props.kind} visible={props.visible}>
      {props.message}
      <CloseButton onClick={props.onClose} />{" "}
    </FlashMessage>
  );
};

export const FlashMessages: React.FC = (props) => {
  const [messages, setMessages] = useState(
    readFlash().map((msg) => ({ ...msg, visible: true }))
  );

  const updateMessages = (predicate: (msg: IFlashMessage) => boolean) => {
    setMessages(
      messages.map((msg) => (predicate(msg) ? { ...msg, visible: false } : msg))
    );
    setFlash(R.reject(predicate, messages));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const displayedIds = messages.map((msg) => msg.id);
      updateMessages((msg) => displayedIds.includes(msg.id));
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  const removeFlash = (id: string) => updateMessages((msg) => msg.id === id);

  return (
    <>
      {messages.map((message, index) => (
        <Flash
          {...message}
          key={index}
          onClose={() => removeFlash(message.id)}
        />
      ))}
    </>
  );
};
