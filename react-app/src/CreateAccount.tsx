/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import { useEffect } from "react";
import * as _ from "lodash";
import styled, { css, keyframes } from "styled-components/macro";
import { useForm, Controller } from "react-hook-form";
import { transparentize } from "polished";

import { formValidations } from "./utils";
import { srpAuthenticate, toCreateAccountParams } from "./srp";
import { AppContainer } from "./AppContainer";
import { Redirect, Link } from "react-router-dom";
import { LoadingAnim } from "./components/LoadingAnim";
import cameraIcon from "./img/camera-icon.svg";
import { AppCrypto } from "./crypto";
import api from "./graphqlApi";
import { Modal } from "./components/Modal";
import { CropImg } from "./components/CropImg";
import { Emoji } from "./components/Emoji";
import { AvatarUpload } from "./components/AvatarUploadInput";
import { Subscribe } from "unstated";
import { Subheading } from "./Signin";
import { CreateUserInput } from "./api/graphql";
import { Btn } from "./components/Button";
import { LegalCheckbox } from "./components/LegalCheckbox";
import { FormError } from "./components/FormError";
import { PublicApi } from "./api";
import env from "./clientEnv";
import theme from "./theme";
const colors = theme.colors.griflan;

export const CreateAccountBanner = styled.div`
  margin: 0 auto;
  font-style: italic;
  font-weight: bold;
  font-size: 2.5em;
  width: 100%;
  text-align: center;
  line-height: 56px;
  margin-bottom: 30px;
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
    margin-bottom: 25px;
  }
`;

const BasicInput = styled.input`
  border: 2px solid #fff;
  opacity: ${(props: { done?: boolean }) => (props.done ? "100%" : "70%")};
  box-sizing: border-box;
  border-radius: 5px;
  margin: 0 auto;
  height: 60px;
  outline: none;

  font-weight: bold;
  font-size: 20px;
  color: #ffffff;
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
    border-color: white;
  }
}`;

const Input = styled(BasicInput)`
  background: ${colors.darkPurple};
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
  margin: 0 auto;
  height: 60px;
  outline: none;

  text-indent: 20px;
  font-weight: bold;
  font-size: 20px;
  color: ${colors.buttermilk};

  &:not([readonly]):hover,
  &:not([readonly]):focus {
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
  height: 60px;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

// const ValidatedInputRowItem = styled.div`
//   height: 60px;

//   & ${ValidatedInputContainer} ${Input} {
//     width: 100%;
//     height: 100%;
//     position: absolute;
//   }
// `;

const ValidatedInputRow = styled.div`
  width: 90%;

  & ${ValidatedInputContainer} ${Input} {
    width: 100%;
    height: 60px;
    position: absolute;
  }

  & > label {
    color: #fff;
    font-size: 14px;
    display: inline-block;
    padding-bottom: 5px;
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

const slideErrorOut = keyframes`{
  from {
    right: 16px;
  }

  to {
    right: -64px;
  }
}`;

export const ValidationEmoji = styled.span`
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
          {...props}
          autoCapitalize="off"
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

const FileUpload = styled.div<{ error: boolean }>`
  border: 2px solid #ffffff;
  box-sizing: border-box;
  border-radius: 5px;
  width: 90%;
  margin: 0 auto;
  height: 60px;
  width: 60px;
  outline: none;

  font-weight: bold;
  font-size: 20px;
  color: #ffffff;

  background-image: url(${cameraIcon}),
    linear-gradient(98.08deg, #8972eb 3.12%, #7f76e7 100.53%);
  background-size: 25px, cover;
  background-repeat: no-repeat;
  background-position: center;

  border: 2px solid #ffffff;
  ${(props) =>
    props.error
      ? css`
          animation: ${inputInvalidAnim} 2s;
          animation-iteration-count: 1;
        `
      : ""}
  box-sizing: border-box;
  border-radius: 5px;
  margin: 0 auto;
  height: 60px;
  outline: none;

  text-indent: 20px;
  font-weight: bold;
  font-size: 20px;

  cursor: pointer;

  &:hover {
    cursor: pointer;
  }

  & input[type="file"] {
    position: absolute;
    left: -10000px;
    opacity: 0;
  }
`;

const Wrap = styled.div`
  max-width: 375px;
  margin: 0 auto;
`;

const LegalAgreement = styled.div`
  display: flex;
  flex-direction: row;

  & > span {
    padding: 0 10px;
    font-size: 14px;
    line-height: 1.5;
    width: 100%;
    color: white;
  }

  a,
  a:visited {
    color: white;
  }
`;

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

const NameAvatarRow = styled.div`
  height: 84px;
  display: flex;
  justify-content: space-between;
  width: 90%;
`;

type ICreateAccount = {
  avatar?: Blob | undefined;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  legalAgreement: boolean;
};

export const CreateAccount: React.FC<{
  app: AppContainer;
  heading: JSX.Element;
}> = (props) => {
  const submitAccount = async (params: CreateUserInput) => {
    await api.CreateUser({
      params,
    });

    return true;
  };

  return (
    <Wrap>
      <CreateAccountBanner>Let's make you an account!</CreateAccountBanner>
      <Subheading>
        Done this already? Go <Link to="/signin">sign in</Link> then.
      </Subheading>
      <CreateAccountForm
        submitAccount={submitAccount}
        app={props.app}
        analyticsLabel="create-account-form/public"
      />
    </Wrap>
  );
};

export const CreateAccountForm: React.FC<{
  app: AppContainer;
  readonly?: { email: string };
  submitAccount: (params: CreateUserInput) => Promise<boolean>;
  analyticsLabel: string;
}> = (props) => {
  const [phase, setPhase] = React.useState<
    "incomplete" | "created" | "authenticated"
  >("incomplete");

  const [gravatarEmail, setGravatarEmail] = React.useState("");

  const defaultValues = env.isDevelopment()
    ? {
        name: "john",
        email: "john@example.com",
        password: "asdf123!",
        passwordConfirmation: "asdf123!",
        legalAgreement: true,
      }
    : {};

  const formHook = useForm<ICreateAccount>({
    mode: "onBlur",
    defaultValues,
  });

  useEffect(() => {
    if (props.readonly) setGravatarEmail(props.readonly.email);
  }, [props.readonly]);

  const createAccount = async (account: ICreateAccount) => {
    let avatarUrl: null | string = null;
    if (account.avatar) {
      const { getAvatarUploadUrl: urls } = await api.GetAvatarUploadUrl();

      avatarUrl = urls.avatarUrl;

      await fetch(urls.uploadUrl, {
        method: "PUT",
        body: account.avatar,
      });
    }

    const email = props.readonly ? props.readonly.email : account.email;

    const { params, masterKey } = await toCreateAccountParams(
      email,
      account.password
    );

    const appCrypto = await AppCrypto.fromKeyMaterial(masterKey);
    const {
      publicKey,
      encryptedPrivateKey,
    } = await appCrypto.createFriendReqKeysForNewAccount();
    await props.submitAccount({
      ...params,
      email,
      avatarUrl,
      username: account.name,
      publicKey,
      encryptedPrivateKey,
    });

    setPhase("created");

    const outcome = await srpAuthenticate(email, account.password);
    if (outcome.kind !== "success")
      throw new Error("Created account but couldn't log in?");

    await props.app.authenticated({
      srpSession: outcome.session,
      masterKey: outcome.masterKey,
      sessionWrapper: outcome.sessionWrapper,
    });

    setPhase("authenticated");
  };

  const {
    register,
    handleSubmit,
    errors,
    formState,
    control,
    getValues,
    setValue,
  } = formHook;

  if (phase === "created") {
    return (
      <Wrap>
        <CreateAccountBanner>You’re in!! 🎉</CreateAccountBanner>
      </Wrap>
    );
  } else if (phase === "authenticated") {
    return <Redirect to="/" />;
  }

  const CreateAccountFormError: React.FC<{
    errors: typeof errors;
    formState: typeof formState;
  }> = (props) => {
    if (props.errors.name?.type === "username-available")
      return <FormError msg={props.errors.name?.message!} />;

    if (props.errors.email?.type === "email-available")
      return <FormError msg={props.errors.email?.message} />;

    const [fieldName, error] =
      _.toPairs(props.errors).find(
        // @ts-ignore
        ([name, _]) => formState.touched[name]
      ) || [];

    if (!fieldName || !error) return null;

    // @ts-ignore
    let errorMessage = error.message;
    if (errorMessage === "") {
      env.bugsnag.notify(
        `Validation for ${fieldName} in CreateAccount form is missing an error message!`
      );
      errorMessage = `${fieldName} is invalid`;
    }

    return <FormError msg={errorMessage} />;
  };

  return (
    <Form
      data-jam-analyze={props.analyticsLabel}
      onSubmit={(ev) => {
        handleSubmit(createAccount)(ev);
      }}
    >
      <CreateAccountFormError errors={errors} formState={formState} />

      <NameAvatarRow>
        <ValidatedInputRow style={{ width: "unset", marginRight: "20px" }}>
          <label htmlFor="avatar">You</label>
          <ValidatedInputContainer>
            <Controller
              as={AvatarUpload}
              email={gravatarEmail}
              control={control}
              name="avatar"
            />
            <>
              <ValidationEmoji
                show={
                  !!formState.touched.avatar &&
                  _.isString((errors.avatar as any)?.message)
                }
              >
                👎
              </ValidationEmoji>
              <ValidationEmoji
                show={
                  !!formState.touched.avatar &&
                  _.isUndefined((errors.avatar as any)?.message)
                }
              >
                👍
              </ValidationEmoji>
            </>
          </ValidatedInputContainer>
        </ValidatedInputRow>
        <ValidatedInputRow>
          <label htmlFor="name">Username</label>
          <ValidatedInputContainer>
            <Input
              data-jam-analyze="input/username"
              name="name"
              maxLength={15}
              placeholder="johndoe1"
              onChange={(event) => {
                setValue(
                  "name",
                  event.target.value.replace(/[^a-zA-Z0-9_]/g, "")
                );
              }}
              ref={register({
                minLength: {
                  value: 2,
                  message: "Username must be at least 2 characters",
                },
                maxLength: {
                  value: 15,
                  message: "Username can't be longer than 15 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message:
                    "Username should only have letters, numbers, and underscores.",
                },
                required: {
                  value: true,
                  message: "You need a username!",
                },
                validate: {
                  "username-available": async (value: unknown | string) => {
                    if (typeof value !== "string") return;
                    if (value === "") return;

                    const isAvailable = await new PublicApi().isUsernameAvailable(
                      value
                    );
                    return isAvailable || "That username is taken";
                  },
                },
              })}
              // @ts-expect-error
              error={errors.name && errors.name.message}
            />
            <>
              <ValidationEmoji
                show={
                  !!formState.touched.name && _.isString(errors.name?.message)
                }
              >
                👎
              </ValidationEmoji>
              <ValidationEmoji
                show={
                  !!formState.touched.name &&
                  _.isUndefined(errors.name?.message)
                }
              >
                👍
              </ValidationEmoji>
            </>
          </ValidatedInputContainer>
        </ValidatedInputRow>
      </NameAvatarRow>
      <ValidatedInputRow>
        <label htmlFor="email">Your email</label>
        <ValidatedInputContainer>
          {props.readonly ? (
            <Input
              data-jam-analyze="input/email"
              name="email"
              placeholder="johndoe@example.com"
              ref={register}
              value={props.readonly.email}
              readOnly
              // @ts-expect-error
              error={errors.email && errors.email.message}
              onBlur={() => setGravatarEmail(getValues().email)}
            />
          ) : (
            <Input
              data-jam-analyze="input/email"
              name="email"
              placeholder="johndoe@example.com"
              ref={register({
                required: {
                  value: true,
                  message: "You need to provide an email to use Jam!",
                },
                validate: {
                  "is-email": formValidations.email,
                  "email-available": async (value: unknown | string) => {
                    if (typeof value !== "string") return;
                    if (value === "") return;

                    const isAvailable = await new PublicApi().isEmailAvailable(
                      value
                    );
                    return (
                      isAvailable ||
                      "That email is already associated with another account"
                    );
                  },
                },
              })}
              // @ts-expect-error
              error={errors.email && errors.email.message}
              onBlur={() => setGravatarEmail(getValues().email)}
              onChange={(event) => setValue("email", event.target.value.trim())}
            />
          )}

          <>
            <ValidationEmoji
              show={
                !!formState.touched.email && _.isString(errors.email?.message)
              }
            >
              👎
            </ValidationEmoji>
            <ValidationEmoji
              show={
                !!formState.touched.email &&
                _.isUndefined(errors.email?.message)
              }
            >
              👍
            </ValidationEmoji>
          </>
        </ValidatedInputContainer>
      </ValidatedInputRow>
      <ValidatedInputRow>
        <label htmlFor="password">Your password</label>
        <ValidatedInputContainer>
          <Input
            data-jam-analyze="input/password"
            name="password"
            type="password"
            placeholder="••••••••"
            ref={register({
              required: {
                value: true,
                message: "You need a password to access your Jam account",
              },
              minLength: {
                value: 6,
                message: "Your password needs to be at least 6 characters",
              },
            })}
            // @ts-expect-error
            error={errors.password && errors.password.message}
          />
          <>
            <ValidationEmoji
              show={
                !!formState.touched.password &&
                _.isString(errors.password?.message)
              }
            >
              👎
            </ValidationEmoji>
            <ValidationEmoji
              show={
                !!formState.touched.password &&
                _.isUndefined(errors.password?.message)
              }
            >
              👍
            </ValidationEmoji>
          </>
        </ValidatedInputContainer>
      </ValidatedInputRow>
      <ValidatedInputRow>
        <label htmlFor="password">Your password, one more time</label>
        <ValidatedInputContainer>
          <Input
            data-jam-analyze="input/password-confirmation"
            name="passwordConfirmation"
            type="password"
            placeholder="••••••••"
            ref={register({
              required: {
                value: true,
                message: "Please type your password in again.",
              },
              validate: {
                "matches-password": (value) => {
                  const { password } = getValues();
                  return (
                    password === value ||
                    "Your password confirmation doesn't match"
                  );
                },
              },
            })}
            // @ts-expect-error
            error={
              errors.passwordConfirmation && errors.passwordConfirmation.message
            }
          />
          <>
            <ValidationEmoji
              show={
                !!formState.touched.passwordConfirmation &&
                _.isString(errors.passwordConfirmation?.message)
              }
            >
              👎
            </ValidationEmoji>
            <ValidationEmoji
              show={
                !!formState.touched.passwordConfirmation &&
                _.isUndefined(errors.passwordConfirmation?.message)
              }
            >
              👍
            </ValidationEmoji>
          </>
        </ValidatedInputContainer>
      </ValidatedInputRow>
      <ValidatedInputRow>
        <ValidatedInputContainer>
          <LegalAgreement>
            <LegalCheckbox
              data-jam-analyze="input/legal-agreement"
              name="legalAgreement"
              ref={register({
                required: {
                  value: true,
                  message:
                    "You need to agree to our terms of service and privacy policy to use Jam",
                },
              })}
              // @ts-expect-error
              error={errors.legalAgreement && errors.legalAgreement.message}
            />
            <span>
              I have read the <Link to="/terms">Terms of Service</Link> and{" "}
              <Link to="/privacy-policy">Privacy Policy</Link>
            </span>
          </LegalAgreement>
        </ValidatedInputContainer>
      </ValidatedInputRow>
      <div style={{ width: "90%", margin: "0 auto", paddingBottom: "20px" }}>
        <Btn
          data-jam-analyze="btn/create-account"
          fontSize={24}
          variant="pink"
          block
          disabled={formState.isSubmitting || !_.isEmpty(errors)}
        >
          {formState.isSubmitting ? <LoadingAnim /> : "Create my account!"}
        </Btn>
      </div>
    </Form>
  );
};
