import * as React from "react";
import { Card } from "./components/Card";
import { Body, Header } from "./components/SimpleMessageCard";
import { Emoji } from "./components/Emoji";
import { AppContainer } from "./AppContainer";
import { Redirect } from "react-router";
import api from "./graphqlApi";
import { Subscribe } from "unstated";
import { WithFlash } from "./Flash";

export const VerifyEmail: React.FC<{
  id: string;
  app: AppContainer;
}> = (props) => {
  const [result, setResult] = React.useState<"loading" | "success" | "fail">(
    "loading"
  );

  React.useEffect(() => {
    const verify = async () => {
      try {
        await api.VerifyEmail({ id: props.id });
        setResult("success");
      } catch (error) {
        console.error("Verify email error: ", error);
        setResult("fail");
      }
    };

    verify();
  }, []);

  React.useEffect(() => {
    if (
      props.app.state.kind === "app/loaded" &&
      props.app.state.currentUser.emailVerified
    )
      setResult("success");
  }, [props.app.state.kind]);

  if (result === "success") {
    let message = "Bam! Email verified.";
    let redirectTo = "/";

    if (props.app.state.kind === "app/unauthenticated") {
      redirectTo = "/signin";
    }

    return (
      <WithFlash message={message} kind="success">
        <Redirect to={redirectTo} />
      </WithFlash>
    );
  }

  return (
    <Card wide>
      {result === "loading" ? (
        <Header>
          <Emoji>👩‍💻</Emoji>
          <h1>Verifying your email...</h1>
        </Header>
      ) : (
        <>
          <Header>
            <Emoji>😬</Emoji>
            <h1>Hm, that didn't work</h1>
          </Header>
          <Body>
            We weren't able to verify your email. The verification may have
            already been used, or it may have expired.
          </Body>
        </>
      )}
    </Card>
  );
};
