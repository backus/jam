import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components/macro";
import * as _ from "lodash";
import icons from "./../icons";

import { assertNever } from "../assertNever";

import {
  Input as RebassInput,
  InputProps as RebassInputProps,
} from "@rebass/forms/styled-components";

const validationIcon = (icon: string) => css`
  background-image: url(${icon});
  background-repeat: no-repeat;
  background-position: right 10px center;
`;

interface InputProps {
  validation: "loading" | "valid" | "invalid";
  touched: boolean;
}

const StyledInput = styled(RebassInput)<InputProps>`
  flex-grow: 1;
  width: 100%;
  height: 35px;
  margin-right: 11px;

  font-size: 16px;
  font-weight: 500;

  box-sizing: border-box;
  color: #83868b;
  caret-color: #83868b;

  &::placeholder {
    color: #d4d5d6;
  }

  ${(props: InputProps) => {
    if (!props.touched) return;

    switch (props.validation) {
      case "loading":
        return validationIcon(icons["spinner.black"]);
      case "invalid":
        if (!props.touched) return null;
        return validationIcon(icons.circledExclamation);
      case "valid":
        return css`
          ${validationIcon(icons["circledCheckmark.whiteOnGreen"])}

          &:not(:focus) {
            background: ${(props) => props.theme.colors.green.primary};
            color: white;
            font-weight: 700;
            border: 2.5px solid ${(props) => props.theme.colors.green.primary};

            ${validationIcon(icons["circledCheckmark.greenOnWhite"])}
          }
        `;
      default:
        return assertNever();
    }
  }}
`;

type Props = {
  validate: (value: string) => Promise<boolean>;
} & Omit<RebassInputProps, "css">;

export const Input: React.FC<Props> = ({ validate, onChange, ...props }) => {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<"loading" | "invalid" | "valid">(
    "invalid"
  );

  useEffect(() => {
    const validateValue = async () => {
      if (typeof props.value !== "string") return;

      setValidation("loading");
      const isValid = await validate(props.value);
      setValidation(isValid ? "valid" : "invalid");
    };

    validateValue();
  }, [props.value]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const value = event.currentTarget.value;

    if (!touched) setTouched(true);
    if (onChange) onChange(event);
  };

  return (
    <StyledInput
      onChange={handleChange}
      validation={validation}
      touched={touched}
      {...props}
    />
  );
};
