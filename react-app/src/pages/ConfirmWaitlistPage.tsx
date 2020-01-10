/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import * as _ from "lodash";
import colors from "./../colors";
import { SimpleCard } from "./../components/Card";
import { Emoji } from "../components/Emoji";
import { PublicApi } from "../api";
import { LoadingPage } from "../components/LoadingAnim";
import { WaitlistStatus } from "../api/graphql";
import { WithFlash } from "../Flash";
import { Redirect, Link } from "react-router-dom";

const Body = styled.div`
  margin: 30px 35px;

  & > h2 {
    color: ${colors.text.primary};
    text-align: center;
    font-size: 20px;
    font-weight: 900;
  }

  & > p {
    font-size: 16px;
    line-height: 1.53;
    color: ${colors.text.info};
  }
`;

export const ConfirmWaitlistPage: React.FC<{ id: string }> = (props) => {
  const [status, setStatus] = useState<null | WaitlistStatus>(null);
  const [error, setError] = useState<null | string>(null);
  const loading = _.isNull(status) && _.isNull(error);

  useEffect(() => {
    const confirmEmail = async () => {
      const outcome = await new PublicApi().confirmWaitlist(props.id);
      if (outcome.kind === "NotFound") {
        setError("Invalid verification id!");
        return;
      }

      setStatus(outcome.data);
    };

    confirmEmail();
  }, []);

  if (loading) return <LoadingPage />;
  if (error)
    return (
      <WithFlash kind="error" message={error}>
        <Redirect to="/" />
      </WithFlash>
    );

  return (
    <SimpleCard>
      <Body>
        {status === "waiting" ? (
          <>
            <h2>
              Done! <Emoji>🤩</Emoji>
            </h2>
            <p>
              We’ve verified your email, so you’re all set. We’ll send you an
              invite to Jam’s beta soon!
            </p>
          </>
        ) : status === "invited" ? (
          <>
            <h2>
              You're invited! <Emoji>🤩</Emoji>
            </h2>
            <p>
              You've been invited to the Jam beta! Search your email for "Jam
              beta invite" to find your invite link.
            </p>
            <p>
              P.S. If the email winds up in your spam folder, could you please
              mark it "not spam?" 🙏
            </p>
          </>
        ) : (
          <>
            <h2>Welcome back 👋</h2>
            <p>
              You've already joined the Jam beta. Did you want to{" "}
              <Link to="/signin">sign in</Link>?
            </p>
          </>
        )}
      </Body>
    </SimpleCard>
  );
};
