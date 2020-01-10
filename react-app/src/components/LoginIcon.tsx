import React, { useState } from "react";
import styled, { css } from "styled-components/macro";

const defaultColors = [
  "#E776B3",
  "#769CE7",
  "#76E7A3",
  "#F3AE6E",
  "#F36E6E",
  "#F36EEE",
  "#D01D1D",
  "#20D01D",
  "#2B1DD0",
  "#CDD01D",
];

const randomColorBy = (letter: string) =>
  defaultColors[letter.charCodeAt(0) % defaultColors.length];

interface IconProps {
  backgroundColor?: string;
  circle?: boolean;
  size: number;
  loginTitle?: string;
}

const LoginIconPlaceholder = styled.div<IconProps>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;

  background: ${(props) => props.backgroundColor || "#f9f5f5"};
  display: block;
  position: relative;

  ${(props) =>
    props.circle &&
    css`
      border-radius: 50%;
    `}

  /* Make broken images display the first letter of title */
  position: absolute;
  top: 0;
  left: 0;
  /* font-size: 32px; */
  font-size: ${(props) => props.size * 0.5}px;
  background: ${(props) => randomColorBy((props.loginTitle || "?")[0])};
  color: white;
  font-weight: 900;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  z-index: 2;
  display: flex;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.25);
`;

const Wrap = styled.div<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  position: relative;
  display: inline-block;
`;

export const LoginIcon: React.FC<IconProps> = (props) => {
  return (
    <Wrap size={props.size}>
      <LoginIconPlaceholder {...props}>
        {(props.loginTitle || "?")[0]}
      </LoginIconPlaceholder>
    </Wrap>
  );
};
