import React, { useState } from "react";
import * as _ from "lodash";
import { Card, Box, Text } from "rebass/styled-components";
import { Label } from "@rebass/forms/styled-components";
import { Btn } from "./Button";
import { Input } from "./Input";
import { Icon } from "./Icon";

export const ChangePassword: React.FC<{
  onSave: (newPassword: string) => Promise<any>;
}> = (props) => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <Box>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          setSubmitting(true);

          await props.onSave(password);
        }}
      >
        <Card
          bg="white"
          p={25}
          mt="22px"
          sx={{
            boxShadow: "card",
            borderRadius: "10px",
          }}
        >
          <Text as="h3" color="griflan.darkPurple">
            Change password
          </Text>
          <Box mt="20px">
            <Label mb="10px" htmlFor="password">
              new password
            </Label>
            <Input
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              name="password"
              type="password"
              validate={async (value) => value.length >= 6}
            />
          </Box>
          <Box mt="20px">
            <Label mb="10px" htmlFor="passwordConfirmation">
              your new password, one more time
            </Label>
            <Input
              value={passwordConfirmation}
              onChange={(event) =>
                setPasswordConfirmation(event.currentTarget.value)
              }
              name="passwordConfirmation"
              type="password"
              validate={async (value) => password === passwordConfirmation}
            />
          </Box>
          <Box
            as="hr"
            my="20px"
            mx="auto"
            sx={{ outline: "none", border: "1px solid #d0d1d2" }}
          />

          <Text
            fontStyle="italic"
            fontSize="14px"
            lineHeight="1.53"
            color="textDetail"
            textAlign="center"
            mt={0}
          >
            Passwords must be at least 6 characters long and should include at
            least 1 digit. After you change your password, you will be logged
            out!
          </Text>
        </Card>

        <Btn block variant="green" height="62px" mt="22px" fontSize="24px">
          {submitting ? <Icon kind="spinner.white" /> : "Save!"}
        </Btn>
      </form>
    </Box>
  );
};
