/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import * as _ from "lodash";
import { transparentize } from "polished";
import styled, { css, keyframes } from "styled-components/macro";
import { formValidations } from "./utils";
import { Field, Form as FinalForm } from "react-final-form";
import { FORM_ERROR } from "final-form";
import { srpAuthenticate } from "./srp";
import { AppContainer } from "./AppContainer";
import { Link } from "react-router-dom";
import { LoadingAnim } from "./components/LoadingAnim";
import env from "./clientEnv";
import { Emoji } from "./components/Emoji";
import { FlashMessages } from "./Flash";
import { Btn } from "./components/Button";
import { FormError } from "./components/FormError";
import theme from "./theme";
const colors = theme.colors.griflan;

const Wrap = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const WelcomeHeader = styled.div`
  margin: 0 auto;
  font-style: italic;
  font-weight: bold;
  font-size: 2.5em;
  width: 100%;
  line-height: 56px;
  margin-bottom: 30px;
  text-align: center;
  align-items: center;
  color: #ffffff;
  text-shadow: 0px 4px 1px rgba(0, 0, 0, 0.25);
`;

const Form = styled.form`
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
    background: ${colors.darkPurple};
    border-color: ${colors.buttermilk};
  }
}`;

const Input = styled(BasicInput as any)`
  background: ${colors.darkPurple};
  border: 2px solid ${colors.buttermilk};
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
  color: ${colors.buttermilk};
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

    color: ${transparentize(0.5, colors.buttermilk)};
  }
`;

const ValidatedInputContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
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

export const ValidationEmoji = (styled.span as any)`
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

const ValidatedInput = (props: any & { meta: FinalFormMeta }) => {
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

export const Subheading = styled.div`
  font-style: italic;
  font-size: 18px;
  margin-bottom: 50px;
  color: white;
  text-align: center;
  align-items: center;

  & > strong {
    font-weight: bold;
  }

  & > a {
    color: white;
  }
`;

const onSubmit = (app: AppContainer) => async (values: unknown) => {
  const { email, password } = values as { email: string; password: string };
  const outcome = await srpAuthenticate(email, password);
  if (outcome.kind === "success") {
    await app.authenticated({
      srpSession: outcome.session,
      sessionWrapper: outcome.sessionWrapper,
      masterKey: outcome.masterKey,
    });
  } else if (outcome.status === 401) {
    return {
      [FORM_ERROR]: "😰 That email and password didn't work",
    };
  } else {
    return {
      [FORM_ERROR]: "Something broke unexpectedly... Sorry about that.",
    };
  }
};

const BtnWrap = styled.div`
  width: 90%;
`;

export const Signin = ({ app }: { app: AppContainer }) => {
  const initialValues =
    process.env.NODE_ENV === "development"
      ? { email: "john@example.com", password: "asdf123!" }
      : {};
  const subheading = env.INVITE_ONLY ? (
    <Subheading>
      <strong>Jam is invite-only right now.</strong>{" "}
      <Link to="/">Join the waitlist</Link> in the meantime, you might get lucky{" "}
      <Emoji>😉</Emoji>
    </Subheading>
  ) : (
    <Subheading>
      New around here? You should{" "}
      <Link to="/accounts/new">create an account!</Link>
    </Subheading>
  );

  return (
    <Wrap>
      <WelcomeHeader>Hi again. Please log in</WelcomeHeader>
      {subheading}
      <FlashMessages />
      <FinalForm
        onSubmit={onSubmit(app)}
        initialValues={initialValues}
        render={({
          handleSubmit,
          form,
          errors,
          submitting,
          pristine,
          values,
          submitError,
        }) => {
          return (
            <Form onSubmit={handleSubmit}>
              {submitError && <FormError msg={submitError} />}
              <Field
                name="email"
                component="input"
                validate={formValidations.email}
              >
                {({ input, meta }: any) => (
                  <ValidatedInput
                    {...input}
                    type="text"
                    placeholder="john@example.com"
                    autoFocus
                    meta={meta}
                  />
                )}
              </Field>
              <Field
                name="password"
                component="input"
                placeholder="••••••••"
                validate={formValidations.notBlank}
              >
                {({ input, meta }: any) => (
                  <ValidatedInput
                    {...input}
                    {...input}
                    type="password"
                    placeholder="••••••••"
                    meta={meta}
                  />
                )}
              </Field>
              <BtnWrap>
                <Btn
                  fontSize={24}
                  block
                  variant="pink"
                  disabled={submitting || !_.isEmpty(errors)}
                >
                  {submitting ? <LoadingAnim /> : "Let me in!"}
                </Btn>
              </BtnWrap>
            </Form>
          );
        }}
      ></FinalForm>
    </Wrap>
  );
};
