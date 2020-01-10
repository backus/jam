import React, { useState } from "react";
import styled, { css, keyframes } from "styled-components/macro";
import * as _ from "lodash";

import { LoadingSpinner } from "./Loading";
import editPencil from "./../img/edit-pencil.svg";
import saveIcon from "./../img/save-icon.svg";
import trashCan from "./../img/trash-can.svg";

const pencilWrite = keyframes`
from {
  transform: rotate(0deg);
}

10% {
  transform: rotate(-20deg) scale(1);
}

20% {
  transform: rotate(-10deg) scale(1);
}

30% {
  transform: rotate(-30deg) scale(0.95);
}

40% {
  transform: rotate(-10deg) scale(0.95);
}

50% {
  transform: rotate(-30deg) scale(0.9);
}

60% {
  transform: rotate(-10deg) scale(0.9);
}

70% {
  transform: rotate(-30deg) scale(0.85);
}

80% {
  transform: rotate(-10deg) scale(0.85);
}

90% {
  transform: rotate(-30deg) scale(0.8);
}

100% {
  transform: rotate(-10deg) scale(0.8);
}
`;

const iconSpin = keyframes`
  from {
    transform: rotate(0deg);
  }

  20% {
    transform: rotate(-20deg);
  }

  90% {
    transform: rotate(380deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const iconShake = keyframes`
  from {
    transform: rotate(0deg) scale(1);
  }

  5% {
    transform: rotate(-20deg) scale(1.03);
  }

  15% {
    transform: rotate(20deg) scale(1.09);
  }

  25% {
    transform: rotate(-20deg) scale(1.15);
  }

  35% {
    transform: rotate(20deg) scale(1.21);
  }

  45% {
    transform: rotate(-20deg) scale(1.27);
  }

  50% {
    transform: rotate(0deg) scale(1.3);
  }

  55% {
    transform: rotate(20deg) scale(1.27);
  }

  65% {
    transform: rotate(-20deg) scale(1.21);
  }

  75% {
    transform: rotate(20deg) scale(1.15);
  }

  85% {
    transform: rotate(-20deg) scale(1.09);
  }

  95% {
    transform: rotate(20deg) scale(1.03);
  }

  to {
    transform: rotate(0deg) scale(1);
  }
`;

const Icon = styled.img`
  display: inline-block;
  vertical-align: text-top;
`;

const EditIcon = styled(Icon).attrs(() => ({ src: editPencil }))``;
const SaveIcon = styled(Icon).attrs(() => ({ src: saveIcon }))``;
const DeleteIcon = styled(Icon).attrs(() => ({ src: trashCan }))``;

const ActionBtn = styled.button.attrs(() => ({ type: "submit" }))<{
  size: number;
  block?: true;
  fontSize?: number;
}>`
  text-decoration: none;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  display: block;
  border: 1px solid;

  ${(props) =>
    props.block &&
    css`
      width: 100%;
    `}

  outline: none;

  transition: all 0.25s ease-in-out;

  position: relative;

  & > ${Icon} {
    margin-left: 10px;
    height: ${(props) => (props.fontSize || 16) * 1.1}px;
  }

  padding: 0 15px 0 10px;

  line-height: ${(props) => props.size}px;

  font-size: ${(props) => props.fontSize || 16}px;
  font-weight: 500;

  &:hover {
    & > ${Icon} {
      animation-fill-mode: forwards;
    }

    cursor: pointer;
  }
`;

const EditButton = styled(ActionBtn)`
  background: #fff;
  color: #a56ff3;
  border-color: white;

  &:hover {
    & > ${Icon} {
      animation-name: ${pencilWrite};
      animation-duration: 2.5s;
    }

    background-color: #f4ecff;
    border-color: #f2e2fe;
  }

  &:active {
    background-color: #e8dbfc;
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.05),
      0px 0px 3px rgba(0, 0, 0, 0.25);
  }
`;

const SaveButton = styled(ActionBtn)`
  background: #51c777;
  color: white;
  border-color: #51c777;

  &:hover {
    & > ${Icon} {
      animation-name: ${iconSpin};
      animation-duration: 1s;
    }

    background-color: #41a461;
    border-color: #41a461;
  }

  &:active {
    border-color: #398f55;
    background-color: #398f55;
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.4),
      0px 0px 3px rgba(0, 0, 0, 0.25);
  }
`;

const DeleteButton = styled(ActionBtn as any)`
  background: #e3245d;
  color: white;
  border-color: #e3245d;

  &:hover {
    & > ${Icon} {
      animation-name: ${iconShake};
      animation-duration: 1s;
    }

    background-color: #cf2256;
    border-color: #cf2256;
  }

  &:active {
    border-color: #ae214c;
    background-color: #ae214c;
    box-shadow: inset 0 0 3px rgba(255, 255, 255, 0.4),
      0px 0px 3px rgba(0, 0, 0, 0.25);
  }
`;

export const EditBtn: React.FC<Parameters<typeof EditButton>[0]> = (props) => {
  return (
    <EditButton {...props}>
      {props.submitting ? (
        <LoadingSpinner />
      ) : (
        <>
          Edit <EditIcon />
        </>
      )}
    </EditButton>
  );
};

export const SaveBtn: React.FC<Parameters<typeof SaveButton>[0]> = (props) => {
  return (
    <SaveButton {...props}>
      {props.submitting ? (
        <LoadingSpinner />
      ) : (
        <>
          Save <SaveIcon />
        </>
      )}
    </SaveButton>
  );
};

export const DeleteBtn: React.FC<Parameters<typeof DeleteButton>[0]> = (
  props
) => {
  return (
    <DeleteButton {...props}>
      {props.submitting ? (
        <LoadingSpinner />
      ) : (
        <>
          Delete <DeleteIcon />
        </>
      )}
    </DeleteButton>
  );
};
