/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import styled from "styled-components/macro";
import * as _ from "lodash";
import colors from "./../colors";
import { SimpleCard } from "./../components/Card";
import { Emoji } from "../components/Emoji";
import { PublicApi } from "../api";
import { LoadingPage } from "../components/LoadingAnim";
import { Link } from "react-router-dom";
import brokenHeartImg from "./../img/broken-heart.svg";
import { FloatingIcon } from "../components/FloatingIcon";
import { Btn } from "../components/Button";
import { LoadingSpinner } from "../components/Loading";
import { parseISO, formatDistanceToNow } from "date-fns";

const Body = styled.div`
  margin: 17px 35px;

  & > h2 {
    margin: 0;
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

  & > button,
  a {
    display: block;
    text-decoration: none;
    margin-top: 30px;
    margin-bottom: 20px;
  }
`;

export const UnsubscribeWaitlist: React.FC<{
  onUnsubscribe: () => Promise<any>;
  betaInviteUri: string;
  joinedWaitlistOn: Date;
}> = (props) => {
  const [state, setState] = useState<
    "start" | "unsubscribing" | "unsubscribed"
  >("start");

  if (state === "unsubscribed") {
    return (
      <SimpleCard>
        <FloatingIcon img={brokenHeartImg} iconSize={50} />
        <Body>
          <h2>Bye!</h2>
          <p>
            We've unsubscribed your email. If you ever change your mind, you can
            always sign back up.
          </p>
        </Body>
      </SimpleCard>
    );
  }

  return (
    <SimpleCard>
      <FloatingIcon img={brokenHeartImg} iconSize={50} />
      <Body>
        <h2>Unsubscribe from Jam?</h2>
        <p>Jam is a service for sharing accounts with friends.</p>

        <p>
          You joined Jam's waiting list{" "}
          {formatDistanceToNow(props.joinedWaitlistOn)} ago, probably after
          seeing Jam on Product Hunt, Tech Crunch, or Twitter.
        </p>

        <p>Are you sure you want to unsubscribe?</p>
        <Btn
          variant="red"
          fontSize={20}
          block
          onClick={async () => {
            setState("unsubscribing");
            await props.onUnsubscribe();
            setState("unsubscribed");
          }}
        >
          {state === "unsubscribing" ? (
            <LoadingSpinner />
          ) : (
            <>
              <Emoji>😢</Emoji> Unsubscribe me
            </>
          )}
        </Btn>
        {state === "start" && (
          <Link to={props.betaInviteUri}>
            <Btn variant="green" fontSize={20} block>
              <Emoji>😃</Emoji> I want to try Jam
            </Btn>
          </Link>
        )}
      </Body>
    </SimpleCard>
  );
};

export const UnsubscribeWaitlistPage: React.FC<{ id: string }> = (props) => {
  const [waitlistEntry, setWaitlistEntry] = useState<{
    id: string;
    createdAt: string;
    unsubscribedAt: string | null;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const loading = !notFound && _.isNull(waitlistEntry);

  useEffect(() => {
    const confirmEmail = async () => {
      const outcome = await new PublicApi().waitlistEntry(props.id);

      if (outcome.kind === "NotFound") {
        setNotFound(true);
        return;
      } else {
        setWaitlistEntry({ id: props.id, ...outcome.data });
      }
    };

    confirmEmail();
  }, [props.id]);

  if (loading) return <LoadingPage />;
  if (notFound)
    return (
      <SimpleCard>
        <Body>
          <h2>Not found!</h2>
          <p>
            We couldn't find an email associated with this unsubscribe link.
          </p>
        </Body>
      </SimpleCard>
    );

  if (waitlistEntry!.unsubscribedAt) {
    return (
      <SimpleCard>
        <Body>
          <h2>You're already unsubscribed!</h2>
          <p>You already unsubscribed from Jam. We won't bug you anymore.</p>
        </Body>
      </SimpleCard>
    );
  }

  return (
    <UnsubscribeWaitlist
      joinedWaitlistOn={parseISO(waitlistEntry!.createdAt)}
      onUnsubscribe={async () =>
        new PublicApi().unsubscribeFromWaitlist(props.id)
      }
      betaInviteUri={`/beta/${props.id}`}
    />
  );
};
