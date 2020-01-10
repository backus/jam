import React, { useState } from "react";
import styled from "styled-components/macro";
import { Btn as BtnComponent } from "./../components/Button";
import { LoadingAnimDynamic } from "../components/LoadingAnim";

const Header = styled.div`
  margin: 25px 0 33px 0;
  height: 90px;
  justify-content: center;
  display: flex;

  & > img {
    height: 90px;
    width: 90px;
    object-fit: cover;
    border-radius: 50%;

    border: 1px solid #ffffff;
    box-sizing: border-box;
    box-shadow: 0px 4px 3px rgba(0, 0, 0, 0.05);
    &:first-child {
      z-index: 1;
    }

    &:nth-child(2) {
      margin-left: -30px;
    }
  }
`;

const Btn = styled(BtnComponent)``;

const Buttons = styled.div`
  --margin: 45px;
  margin: 0 var(--margin) 30px var(--margin);
  width: calc(100% - var(--margin) * 2);
  display: flex;

  & > ${Btn} {
    margin-left: 10px;
    transition: width 2s ease-in;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  width: 100%;
  margin: 0 auto;
  background: #ffffff;
  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  color: black;
  position: relative;

  & > p {
    font-size: 14px;
    text-align: center;
    color: #555a60;
    padding: 0 30px;
    line-height: 1.53;
    margin: 0 0 30px 0;
  }
`;

export const Notification: React.FC<{
  primaryImg: string | JSX.Element;
  secondaryImg?: string;
  description: JSX.Element;
  acceptText: string;
  rejectText: string;
  acceptDoneText: string;
  rejectDoneText: string;
  onAccept: () => Promise<any>;
  onReject: () => Promise<any>;
}> = (props) => {
  const [state, setState] = useState<
    | "default"
    | "submit/accept"
    | "submit/reject"
    | "done/accept"
    | "done/reject"
  >("default");

  const handleClick = async (newState: "submit/accept" | "submit/reject") => {
    if (state !== "default") return;

    setState(newState);

    if (newState === "submit/accept") {
      await props.onAccept();
      setState("done/accept");
    } else if (newState === "submit/reject") {
      await props.onReject();
      setState("done/reject");
    }
  };

  return (
    <Card>
      <Header>
        {typeof props.primaryImg === "string" ? (
          <img src={props.primaryImg} />
        ) : (
          props.primaryImg
        )}
        {props.secondaryImg && <img src={props.secondaryImg} />}
      </Header>
      {props.description}
      <Buttons>
        {!state.endsWith("reject") && (
          <Btn
            variant="green"
            block
            fontSize={18}
            disabled={state !== "default"}
            onClick={() => handleClick("submit/accept")}
          >
            {state === "default" ? (
              props.acceptText
            ) : state === "submit/accept" ? (
              <LoadingAnimDynamic height={18} />
            ) : (
              props.acceptDoneText
            )}
          </Btn>
        )}
        {!state.endsWith("accept") && (
          <Btn
            variant="red"
            block
            fontSize={18}
            disabled={state !== "default"}
            onClick={() => handleClick("submit/reject")}
          >
            {state === "default" ? (
              props.rejectText
            ) : state === "submit/reject" ? (
              <LoadingAnimDynamic height={18} />
            ) : (
              props.rejectDoneText
            )}
          </Btn>
        )}
      </Buttons>
    </Card>
  );
};
