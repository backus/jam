import styled, { css, keyframes } from "styled-components/macro";

import checkmark from "../img/checkmark.svg";

const glowingRed = keyframes`
  from {
    background: #F383A4;
    border: 2px solid #f24a7c;
  }

  50% {
    background: #f24a7c;
    border-color: #F5064E;
  }

  to {
    background: #F383A4;
    border-color: #f24a7c;
  }

`;

export const LegalCheckbox = styled.input.attrs({
  type: "checkbox",
})<{ error?: string }>`
  width: 25px;
  height: 25px;
  cursor: pointer;
  background: #31115e;
  border-radius: 3px;
  border: 2px solid #d6cef8;
  appearance: none;
  outline: none;
  transition: background-color 0.5s ease;

  &:hover {
    transition: border-color 0.5s ease;
    border-color: white;
  }

  &:checked {
    background-image: url(${checkmark});
    background-repeat: no-repeat;
    background-position: center center;
  }

  ${(props) =>
    props.error &&
    css`
      background: #f383a4;
      border: 2px solid #f24a7c;
      animation: ${glowingRed} 2s ease-in-out infinite;
    `}
`;
