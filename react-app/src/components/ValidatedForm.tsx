/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import * as _ from "lodash";
import styled, { css, keyframes } from "styled-components/macro";

export const Form = styled.form`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  & > * {
    margin-bottom: 38px;
  }
`;

const BasicInput = styled.input`
  border: 2px solid #ffffff;
  opacity: ${(props: { done?: boolean }) => (props.done ? "100%" : "70%")};
  box-sizing: border-box;
  border-radius: 5px;
  width: 90%;
  margin: 0 auto;
  height: 60px;
  outline: none;

  font-weight: bold;
  font-size: 20px;
  color: #ffffff;

  /* margin-bottom: 38px; */
`;

const inputInvalidAnim = keyframes`{
  from {
    box-shadow: 0 0 10px rgba(243, 60, 60, 1);
    border-color: rgba(243, 60, 60, 0.5);
    background: rgba(243, 60, 60, 0.75);
  }

  10% {
    box-shadow: 0 0 10px rgba(243, 60, 60, 1);
    border-color: rgba(243, 60, 60, 1);
    background: rgba(243, 60, 60, 0.75);
  }

  to {
    box-shadow: none;
    background: linear-gradient(
      98.08deg,
      #8972eb 3.12%,
      #7f76e7 100.53%
    );
    border-color: white;
  }
}`;

const Input = styled(BasicInput)`
  background: linear-gradient(98.08deg, #8972eb 3.12%, #7f76e7 100.53%);
  border: 2px solid #ffffff;
  opacity: ${(props: { done?: boolean }) => (props.done ? "100%" : "70%")};
  ${(props: { error?: string }) =>
    props.error
      ? css`
          animation: ${inputInvalidAnim} 2s;
          animation-iteration-count: 1;
        `
      : ""}
  box-sizing: border-box;
  border-radius: 5px;
  width: 90%;
  margin: 0 auto;
  height: 60px;
  outline: none;

  text-indent: 20px;
  font-weight: bold;
  font-size: 20px;
  color: #ffffff;
  /* margin-bottom: 38px; */

  &:hover,
  &:focus {
    opacity: 100%;
  }

  &::placeholder {
    font-weight: bold;
    font-size: 20px;
    line-height: 23px;
    display: flex;
    align-items: center;
    text-indent: 20px;

    color: #b7a9f0;
  }
`;

const ValidatedInputContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  /* overflow: hidden; */
`;

const ValidatedInputRow = styled.div`
  width: 90%;
  height: 60px;
  /* margin-bottom: 38px; */

  & pre {
    margin-top: 250px;
  }

  & ${ValidatedInputContainer} ${Input} {
    width: 100%;
    height: 100%;
    position: absolute;
  }
`;

const slideErrorIn = keyframes`{
  from {
    right: -64px;
  }

  33% {
    right: 16px;
  }

  66% {
    right: 16px;
  }

  to {
    right: -64px;
  }
}`;

const ValidationEmoji = styled.span`
  font-size: 24px;
  top: 16px;
  right: -64px;
  position: absolute;

  ${(props: { show: boolean }) =>
    props.show &&
    css`
      animation: ${slideErrorIn} 3s;
      animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `}
`;

interface FinalFormMeta {
  active?: boolean;
  data?: Object;
  dirty?: boolean;
  dirtySinceLastSubmit?: boolean;
  error?: any;
  initial?: any;
  invalid?: boolean;
  length?: number;
  modified?: boolean;
  pristine?: boolean;
  submitError?: any;
  submitFailed?: boolean;
  submitSucceeded?: boolean;
  submitting?: boolean;
  touched?: boolean;
  valid?: boolean;
  validating?: boolean;
  visited?: boolean;
}

export const ValidatedInput = (props: any & { meta: FinalFormMeta }) => {
  const { meta } = props;
  let validationEmoji = null;

  // Track if this component has been valid before so we can
  // flash invalid, before unfocus, if the user modifies
  const [wasValid, setWasValid] = React.useState(false);

  const shouldShowError =
    (meta.touched || wasValid) && meta.dirty && meta.error;
  if (!meta.error && !wasValid && !meta.pristine) setWasValid(true);
  validationEmoji = (
    <>
      <ValidationEmoji show={shouldShowError}>👎</ValidationEmoji>
      <ValidationEmoji show={!meta.error}>👍</ValidationEmoji>;
    </>
  );

  return (
    <ValidatedInputRow>
      <ValidatedInputContainer>
        <Input
          autoCapitalize="off"
          {...props}
          error={shouldShowError ? meta.error : null}
        />
        {validationEmoji}
      </ValidatedInputContainer>
    </ValidatedInputRow>
  );
};

export const SubmitBtn = styled.button.attrs(() => ({
  type: "submit",
}))`
  border: 2px solid #ffffff;
  box-sizing: border-box;
  border-radius: 5px;
  outline: none;
  height: 60px;
  width: 90%;
  border: none;
  font-style: italic;
  font-weight: bold;
  font-size: 24px;
  line-height: 28px;
  align-items: center;
  text-align: center;
  opacity: 100%;

  &:disabled {
    background-color: #c25cdc;
  }

  background-color: #f253cf;
  cursor: pointer;

  color: #ffffff;
`;

const FormErrorBlock = styled.span`
  background: rgba(243, 60, 60, 0.8);
  border-radius: 10px;
  font-size: 18px;
  font-weight: 500;
  width: 90%;
  height: 59px;
  display: ${({ visible }: { visible: boolean }) =>
    visible ? "inline-block" : "none"};
  text-align: center;
  line-height: 59px;
  color: white;

  animation: slide-into-view 1s;

  @keyframes slide-into-view {
    from {
      height: 0px;
    }

    50% {
      height: 59px;
    }

    to {
      color: white;
    }
  }
`;
