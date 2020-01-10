import React, { useState, useEffect } from "react";
import { LoadedApp } from "./../AppContainer";
import * as _ from "lodash";
import { EditLogin } from "./../components/EditLogin";

import { Redirect } from "react-router-dom";
import { LoginV1 } from "./../types";
import { TShareRecipient } from "./../api";
import { LoadingPage } from "../components/LoadingAnim";
import { LoginType } from "./../api/graphql";
import { MagicLinkGuide } from "../components/MagicLinkGuide";
import { useCurrentBrowserEnv } from "../BrowserEnv";

export const NewMagicLink: React.FC<{
  browserStateLogin: LoginV1;
  addLogin: (login: {
    details: LoginV1;
    shareWith: TShareRecipient[];
    sharePreviews: boolean;
  }) => Promise<string>;
  friends: TShareRecipient[];
}> = (props) => {
  const [newLoginId, setNewLoginId] = useState<null | string>(null);

  const addLogin = async ({
    login,
    shareWith,
    sharePreviews,
  }: {
    login: LoginV1;
    shareWith: TShareRecipient[];
    sharePreviews: boolean;
  }) => {
    const loginId = await props.addLogin({
      details: login,
      shareWith,
      sharePreviews,
    });

    setNewLoginId(loginId);
  };

  if (newLoginId) return <Redirect to={`/login/${newLoginId}`} />;

  return (
    <EditLogin
      type={LoginType.BrowserState}
      login={props.browserStateLogin}
      onSubmit={addLogin}
      sharePreviews
      friends={props.friends}
    />
  );
};

export const NewMagicLinkPage: React.FC<{ app: LoadedApp }> = (props) => {
  const [friends, setFriends] = useState<TShareRecipient[]>([]);
  const [browserStateLogin, setBrowserStateLogin] = useState<LoginV1 | null>(
    null
  );
  const [rejected, setRejected] = useState(false);
  const chromeEnv = useCurrentBrowserEnv();

  useEffect(() => {
    const loadFriends = async () =>
      setFriends(await props.app.api().getPotentialShares());

    loadFriends();
  }, []);

  useEffect(() => {
    const extractLogin = async () => {
      const outcome = await chromeEnv.extractBrowserState(props.app);

      if (outcome.kind === "success") {
        setBrowserStateLogin(outcome.value);
      } else {
        setRejected(true);
      }
    };

    extractLogin();
  }, []);

  if (rejected) {
    return <MagicLinkGuide />;
  }

  if (!browserStateLogin) {
    return <LoadingPage />;
  }

  return (
    <NewMagicLink
      browserStateLogin={browserStateLogin}
      addLogin={async (data) => {
        const {
          createLogin: { id },
        } = await props.app.addLogin({ ...data, type: LoginType.BrowserState });
        return id;
      }}
      friends={friends}
    />
  );
};
