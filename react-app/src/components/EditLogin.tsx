import React, { useState, useEffect } from "react";
import { Card, Cards } from "./../components/Card";
import styled from "styled-components/macro";
import { LoginDetail, LoginField } from "./../components/LoginDetail";
import { FormError } from "./FormError";
import { ValidationEmoji } from "./../Signin";
import { Field, Form as FinalForm } from "react-final-form";
import * as _ from "lodash";
import { formValidations, indefiniteArticle } from "./../utils";
import { ViewLoginHeader } from "./../components/LoginDescription";
import { LoginV1 } from "./../types";
import TextareaAutosize from "react-autosize-textarea";
import { SelectUsers } from "./../components/SelectUsers";
import { ConfirmDelete } from "./ConfirmDelete";
import { Grid } from "./../components/LoginMember";
import { TShareRecipient } from "../api";
import { DeleteBtn as DeleteBtnComponent, SaveBtn } from "./ActionBtns";
import { Switch } from "./Switch";
import { Flex, Text, Box } from "rebass/styled-components";
import { LoginType } from "../api/graphql";
import { MagicLinkCard } from "./MagicLinkCard";

const setFieldData = require("final-form-set-field-data").default;

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

const ValidatedInputContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const ValidatedInputRow = styled.div`
  height: 60px;

  padding-bottom: 20px;

  & ${ValidatedInputContainer} input {
    height: 100%;
    position: absolute;

    left: 5px;
    top: 5px;
    height: 40px;
    padding-left: 5px;
    border: 0;

    border: none;
    outline: none;
    vertical-align: baseline;

    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    color: #333333;
  }

  &:first-child {
    margin-top: 20px;
  }

  &:last-child {
    padding-bottom: 0;
    & ${LoginField} {
      border-bottom: 0;
    }
  }
`;

const ValidatedInput = (
  props: any & {
    "data-jam-analyze"?: string;
    autoFocus?: boolean;
    className?: string;
    meta: FinalFormMeta;
  }
) => {
  const { meta } = props;
  let validationEmoji = null;

  // We keep track of whether the field is currently valid and previous valid.
  // If isValid != wasValid, we should probably be showing a validation emoji
  const isValid = !meta.invalid;
  const [wasValid, setWasValid] = React.useState(isValid);

  const [showValidation, setShowValidation] = useState<
    "none" | "valid" | "invalid"
  >("none");

  useEffect(() => {
    const isValid = !meta.error;

    if (!wasValid && isValid) {
      setShowValidation("valid");
      setWasValid(true);
    } else if (wasValid && !isValid) {
      // When the value starts as an empty string, for some reason the first render
      // says it is valid then there is an immediate rerender marking field as invalid.
      // To avoid showing a thumbs down on page load, we check if field is pristine
      if (!meta.pristine) setShowValidation("invalid");
      setWasValid(false);
    }
  }, [meta.error, meta.pristine, wasValid]);

  validationEmoji = (
    <>
      <ValidationEmoji show={showValidation === "invalid"}>👎</ValidationEmoji>
      <ValidationEmoji show={showValidation === "valid"}>👍</ValidationEmoji>
    </>
  );

  return (
    <ValidatedInputRow className={props.className}>
      <ValidatedInputContainer>
        <LoginDetail
          data-jam-analyze={props["data-jam-analyze"]}
          autoFocus={props.autoFocus}
          onChange={props.onChange}
          name={props.name}
          type={props.type}
          kind={props.kind}
          value={props.value}
          placeholder={props.placeholder}
          error={meta.error}
        />
        {validationEmoji}
      </ValidatedInputContainer>
    </ValidatedInputRow>
  );
};

export const LoginTitle = styled.input`
  font-size: 24px;
  line-height: 28px;
  font-weight: bold;

  color: #2c3c55;

  flex: none;
  order: 0;
  align-self: flex-start;
`;

const TitleSection = styled.div`
  position: relative;
`;

const TitleError = styled.span`
  position: absolute;
  font-size: 14px;
  vertical-align: middle;
  color: #e3245d;
  bottom: 15px;

  &::before {
    margin-right: 8px;
    content: "!";
    background: #e3245d;
    width: 18px;
    height: 18px;
    font-size: 14px;
    text-align: center;
    border-radius: 50%;
    display: inline-block;
    color: white;
    font-weight: bold;
  }
`;

const TitleField = styled.input`
  height: 100%;
  font-size: 24px;
  line-height: 28px;
  font-weight: bold;

  width: 100%;

  color: #2c3c55;

  outline: none;
  border: none;
  padding: 0;
`;

const BoringIconChar = styled.span`
  width: 55px;
  height: 55px;
  text-align: center;
  line-height: 55px;
  font-size: 36px;
  background: #e6e8f1;
  color: #6b64b2;
  text-transform: uppercase;
  font-weight: 900;
  border-radius: 10px;
`;

const IconWrap = styled.div`
  display: flex;
  margin-left: auto;
  margin: 35px 0 35px auto;
`;

const BoringIcon = (props: { title: string | undefined }) => {
  const title = props.title || "";
  const char = title.match(/^\s*$/) ? "?" : title[0];

  return <BoringIconChar>{char}</BoringIconChar>;
};

const LoginDescription = styled.div`
  & textarea {
    width: 100%;
    min-height: 50px;
    border: none;
    height: 100%;
    resize: vertical;
    outline: none;
    /* padding: 10px; */
    font-size: 16px;
    color: #555a60;
    text-align: left;
    line-height: 24px;

    &::placeholder {
      color: #aaacaf;
      text-align: center;
      vertical-align: middle;
      font-style: italic;
    }
  }
`;

const DeleteBtn = styled(DeleteBtnComponent)``;

const Btns = styled.div`
  display: flex;

  /* Kind of a hack. Basically, if a user edits a login and then presses enter to submit, the browser triggers
   * the first button (in terms of position in the DOM) within the form. We want the Delete button to be on the left,
   * but we obviously don't want a user to edit their login details, hit enter to submit, and then be taken to
   * the "are you sure you want to delete?" prompt.
  */
  & > ${DeleteBtn} {
    order: -1;
  }

  & > button {
    margin-left: 20px;

    &:last-child {
      margin-left: 0;
    }
  }
`;

type TMaybeShowDelete =
  | { showDelete?: undefined | false }
  | { showDelete: true; onDelete: () => Promise<any> };

const NEW_LOGIN_PLACEHOLDER = "New Login";

export const EditLogin: React.FC<
  {
    type: LoginType;
    login?: LoginV1;
    sharingWith?: TShareRecipient[];
    sharePreviews?: boolean;
    friends: TShareRecipient[];
    onSubmit: (data: {
      login: LoginV1;
      shareWith: TShareRecipient[];
      sharePreviews: boolean;
    }) => Promise<any>;
  } & TMaybeShowDelete
> = (props) => {
  const login = props.login || {
    info: {
      domain: null,
      title: "",
    },
    detail: {},
    secret: {},
  };

  const sharingWith = props.sharingWith || [];

  const [isDeleting, setIsDeleting] = useState<"no" | "confirm" | "submitting">(
    "no"
  );

  if (props.showDelete && isDeleting === "confirm") {
    return (
      <ConfirmDelete
        title={
          <>
            Are you sure you want to delete your{" "}
            <strong>{login.info.title}</strong> login?
          </>
        }
        body={
          <>
            Your <strong>{login.info.title}</strong> login data will be
            permanently deleted from Jam and your friends will no longer have
            access.
          </>
        }
        deleteButtonText="Yes, delete the data."
        onBack={() => setIsDeleting("no")}
        onDelete={props.onDelete}
      />
    );
  }

  return (
    <FinalForm
      onSubmit={(data) => {
        if (_.isEmpty(data.login.info.title))
          data.login.info.title = NEW_LOGIN_PLACEHOLDER;
        props.onSubmit(data);
      }}
      initialValues={{
        login,
        shareWith: sharingWith,
        sharePreviews: !!props.sharePreviews,
      }}
      mutators={{ setFieldData }}
      render={({
        form,
        handleSubmit,
        errors,
        submitting,
        values,
        submitError,
      }) => {
        return (
          <form onSubmit={handleSubmit}>
            <Cards>
              <FormError msg={submitError} />

              <Card wide verticalPadding={0}>
                <ViewLoginHeader>
                  <Field
                    name="login.info.title"
                    validate={
                      props.showDelete ? formValidations.notBlank : undefined
                    }
                  >
                    {({ input, meta }) => (
                      <TitleSection>
                        {meta &&
                          (meta.modified || meta.data?.blurred) &&
                          meta.error && (
                            <TitleError>Give this login a name!</TitleError>
                          )}
                        <TitleField
                          {...input}
                          placeholder={NEW_LOGIN_PLACEHOLDER}
                          data-jam-analyze="edit-login/title"
                          autoFocus
                          value={values.login.info.title}
                          onChange={input.onChange}
                          onFocus={(ev: any) => {
                            if (meta.pristine) ev.currentTarget.select();
                            input.onFocus(ev);
                          }}
                          onBlur={() => {
                            // We can't just use state hooks because final form is controlling
                            // things for us, so we use this field data mutator thing to
                            // write some metadata saying the title field has been blurred.
                            form.mutators.setFieldData("login.info.title", {
                              blurred: true,
                            });
                          }}
                        />
                      </TitleSection>
                    )}
                  </Field>
                  <IconWrap>
                    <BoringIcon title={values.login.info.title} />
                  </IconWrap>
                </ViewLoginHeader>
              </Card>
              {props.type === LoginType.RawCredentials ? (
                <Card wide label="credentials" verticalPadding={0}>
                  <Field
                    name="login.secret.rawCredentials.username"
                    component="input"
                    validate={formValidations.notBlank}
                  >
                    {({ input, meta }: any) => (
                      <ValidatedInput
                        {...input}
                        data-jam-analyze="edit-login/username"
                        name="username"
                        type="text"
                        kind="username"
                        placeholder="john@example.com"
                        meta={meta}
                      />
                    )}
                  </Field>
                  <Field
                    name="login.secret.rawCredentials.password"
                    component="input"
                    placeholder="••••••••"
                    validate={formValidations.notBlank}
                  >
                    {({ input, meta }: any) => (
                      <ValidatedInput
                        data-jam-analyze="edit-login/password"
                        {...input}
                        name="password"
                        type="password"
                        kind="password"
                        placeholder="••••••••"
                        meta={meta}
                      />
                    )}
                  </Field>
                </Card>
              ) : (
                <MagicLinkCard />
              )}
              <Card wide label="description" verticalPadding={40}>
                <LoginDescription>
                  <Field
                    name="login.detail.note"
                    component="textarea"
                    placeholder="Describe the account for your friends. Maybe set a few ground rules."
                  >
                    {({ input, meta }: any) => (
                      <TextareaAutosize
                        {...input}
                        data-jam-analyze="edit-login/description"
                        placeholder="Describe the account for your friends. Maybe set a few ground rules."
                      />
                    )}
                  </Field>
                </LoginDescription>
              </Card>
              {props.friends.length > 0 && (
                <Card wide label="share with" verticalPadding={40} flush>
                  <Grid>
                    <Field name="shareWith">
                      {({ input }: any) => (
                        <SelectUsers
                          selected={sharingWith}
                          users={props.friends}
                          onChange={(selectedUsers) => {
                            input.onChange(selectedUsers);
                          }}
                        />
                      )}
                    </Field>
                  </Grid>
                </Card>
              )}
              <Card wide label="visibility" verticalPadding={40} flush>
                <Flex
                  id="visibility"
                  flexDirection="column"
                  sx={{
                    px: "38px",
                    "@media screen and (max-width: 320px)": {
                      px: "20px",
                    },
                  }}
                >
                  <Flex alignItems="center">
                    <Field name="sharePreviews">
                      {({ input }: any) => (
                        <Switch
                          checked={values.sharePreviews}
                          onClick={() => input.onChange(!values.sharePreviews)}
                          height="35px"
                          width="76px"
                          buttonSize="31.5px"
                        />
                      )}
                    </Field>
                    <Box mx="auto" minWidth="15px" />
                    <Text
                      variant="info"
                      fontSize="18px"
                      verticalAlign="middle"
                      textAlign="center"
                    >
                      Let friends request access
                    </Text>
                  </Flex>
                  <Text
                    variant="detail"
                    fontSize="16px"
                    mt="26px"
                    textAlign="center"
                  >
                    {values.sharePreviews ? (
                      <>
                        Jam will automatically show all of your friends that you{" "}
                        <u>have</u>{" "}
                        {values.login.info.title &&
                        values.login.info.title !== "Untitled" ? (
                          <>
                            {indefiniteArticle(values.login.info.title)}{" "}
                            <strong>{values.login.info.title}</strong>
                          </>
                        ) : (
                          "this"
                        )}{" "}
                        account.
                      </>
                    ) : (
                      <>
                        <p>
                          Your friends will not know you have this account
                          unless you explicitly share it with them.
                        </p>
                      </>
                    )}
                  </Text>
                </Flex>
              </Card>
              <Btns>
                <SaveBtn
                  block
                  data-jam-analyze="edit-login/save-btn"
                  fontSize={24}
                  iconSize={20}
                  size={60}
                  submitting={submitting}
                  disabled={
                    submitting || isDeleting !== "no" || !_.isEmpty(errors)
                  }
                />
                {props.showDelete && (
                  <DeleteBtn
                    data-jam-analyze="edit-login/delete-btn"
                    onClick={async () => {
                      if (isDeleting !== "no") return;
                      setIsDeleting("confirm");
                    }}
                    fontSize={24}
                    block
                    iconSize={20}
                    size={60}
                  />
                )}
              </Btns>
            </Cards>
          </form>
        );
      }}
    ></FinalForm>
  );
};

export type TPotentialShare = {
  kind: "Friend" | "Invite";
  id: string;
  avatarUrl?: string;
  name: string;
};
