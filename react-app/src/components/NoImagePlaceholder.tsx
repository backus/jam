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
  text?: string;
}

export const NoImagePlaceholder = styled.span<IconProps>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;

  display: block;
  position: relative;

  ${(props) =>
    props.circle &&
    css`
      border-radius: 50%;
    `}

  /* Make broken images display the first letter of title */
  /* font-size: 32px; */
  font-size: ${(props) => props.size * 0.5}px;
  border-radius: 50%;
  background: ${(props) =>
    props.backgroundColor || randomColorBy((props.text || "?")[0])};
  &::before {
    content: "${(props) => (props.text || "?")[0]}";
  }
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
