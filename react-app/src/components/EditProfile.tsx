import React, { useState } from "react";
import * as _ from "lodash";
import styled from "styled-components/macro";
import { Card, Box, Text, Image, Flex } from "rebass/styled-components";
import { Label } from "@rebass/forms/styled-components";
import { CroppableImageUpload } from "./CroppableImageUpload";
import { Btn } from "./Button";
import { SaveBtn } from "./ActionBtns";
import { Input } from "./Input";
import selfieIcon from "./../img/selfie-icon.svg";
import { Icon } from "./Icon";
import clientEnv from "./../clientEnv";
import { Avatar } from "../Avatar";

const Separator = styled.hr`
  margin: 20px auto;
  width: 100%;
  outline: none;
  border: 1px solid #d0d1d2;
`;

interface EditProfileProps {
  avatarUrl: string;
  email: string;
  username: string;
  checkIsUsernameAvailable: (value: string) => Promise<boolean>;
  onSave: (changes: { avatar?: Blob; username?: string }) => Promise<any>;
}

export const EditProfile: React.FC<EditProfileProps> = (props) => {
  const [usernameAvailability, setUsernameAvailability] = useState<
    null | "unavailable" | "available"
  >(null);

  const [username, setUsername] = useState(props.username);

  const [avatar, setAvatar] = useState<{ url: string; data?: Blob }>({
    url: props.avatarUrl,
  });

  const [submitting, setSubmitting] = useState(false);

  const submitDisabled = () =>
    submitting ||
    usernameAvailability === "unavailable" ||
    (username === props.username && avatar.url === props.avatarUrl);

  return (
    <Box>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (submitDisabled()) return;

          setSubmitting(true);

          const success = await props.onSave({ avatar: avatar.data, username });
          // A successful save means we are redirecting
          if (success) return;

          setSubmitting(false);
        }}
      >
        <Card
          bg="white"
          p={25}
          sx={{
            boxShadow: "card",
            borderRadius: "10px",
          }}
        >
          <Flex>
            <Box width={0.35} px={2}>
              <CroppableImageUpload onImageChange={setAvatar}>
                <Flex
                  flexDirection="column"
                  alignItems="center"
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  <Avatar
                    circle
                    size="103px"
                    uri={avatar.url}
                    sx={{
                      objectFit: "fill",
                      border: "1.5px solid #E1E2E3",
                      transition: "all 0.2s ease-in",
                      ":hover": {
                        borderColor: "#BAC8E2",
                        filter: "grayscale(0%) opacity(75%)",
                      },
                    }}
                    mb={15}
                  />
                  <Btn
                    // If it isn't rendered as a div, pressing enter in the username form
                    // somehow opens the file upload  dialogue
                    as="div"
                    block
                    variant="pink"
                    fontWeight="medium"
                    fontSize={12}
                    px={0}
                    py="5px"
                    sx={{ textShadow: null, fontStyle: "normal" }}
                  >
                    <Image
                      display="inline-block"
                      src={selfieIcon}
                      height={11}
                      width={11}
                      mr="6px"
                    />
                    Select photo
                  </Btn>
                </Flex>
              </CroppableImageUpload>
            </Box>
            <Box mx="auto" />
            <Box width={0.58} px={2}>
              <Box>
                <Label mb="10px">email</Label>
                <Text variant="info"> {props.email}</Text>
              </Box>
              <Box mt="20px">
                <Label mb="10px" htmlFor="username">
                  username
                </Label>
                <Input
                  onChange={(event) =>
                    setUsername(
                      event.target.value.replace(/[^a-zA-Z0-9_]/g, "")
                    )
                  }
                  validate={async (value) => {
                    if (value === props.username) {
                      setUsernameAvailability("available");
                      return true;
                    }

                    setUsernameAvailability(null);
                    const isAvailable = await props.checkIsUsernameAvailable(
                      value
                    );
                    setUsernameAvailability(
                      isAvailable ? "available" : "unavailable"
                    );

                    return (
                      isAvailable &&
                      value.length >= 2 &&
                      value.length <= 15 &&
                      /^[a-zA-Z0-9_]+$/.test(value)
                    );
                  }}
                  minLength={2}
                  maxLength={15}
                  name="username"
                  value={username}
                  spellCheck="false"
                />
              </Box>
              {usernameAvailability === "unavailable" && (
                <Text
                  fontSize="13px"
                  fontStyle="italic"
                  color="textDetail"
                  mt="18px"
                  mb="-7px"
                  display="block"
                >
                  That username isn't available!
                </Text>
              )}
            </Box>
          </Flex>
          <Separator />
          <Text
            fontStyle="italic"
            fontSize="14px"
            lineHeight="1.53"
            color="textDetail"
            textAlign="center"
            mt={0}
          >
            We show your username and avatar to your friends. Pick a picture
            they will recognize!
          </Text>
        </Card>

        <Btn
          block
          variant="green"
          height="62px"
          mt="22px"
          fontSize="24px"
          disabled={submitDisabled()}
        >
          {submitting ? <Icon kind="spinner.white" /> : "Save!"}
        </Btn>
      </form>
    </Box>
  );
};
