import React, { useState } from "react";
import styled, { css } from "styled-components/macro";

const FormErrorBlock = styled.span<{ visible: boolean }>`
  background: rgba(243, 60, 60, 0.8);
  border-radius: 10px;
  font-size: 18px;
  font-weight: 500;
  width: 100%;
  display: block;
  text-align: center;
  line-height: 1.53;
  padding: 20px;
  color: white;
  word-wrap: wrap;
  min-height: 27px;

  ${(props) =>
    props.visible
      ? css`
          opacity: 1;
        `
      : css`
          opacity: 0;
          display: none;
        `}

  transition: all 0.5s ease-in-out;
`;

export const FormError = (props: { msg?: React.ReactChild }) => (
  <FormErrorBlock visible={!!props.msg}>{props.msg || ""}</FormErrorBlock>
);
