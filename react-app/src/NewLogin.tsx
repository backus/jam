import React, { useState, useEffect } from "react";
import { LoadedApp } from "./AppContainer";
import * as _ from "lodash";
import { EditLogin } from "./components/EditLogin";

import { Redirect } from "react-router-dom";
import { LoginV1 } from "./types";
import { TShareRecipient } from "./api";
import { LoginType } from "./api/graphql";

export const NewLogin: React.FC<{
  addLogin: (login: {
    details: LoginV1;
    shareWith: TShareRecipient[];
    sharePreviews: boolean;
  }) => Promise<any>;
  friends: TShareRecipient[];
}> = (props) => {
  const [submitted, setSubmitted] = useState(false);

  const addLogin = async ({
    login,
    shareWith,
    sharePreviews,
  }: {
    login: LoginV1;
    shareWith: TShareRecipient[];
    sharePreviews: boolean;
  }) => {
    await props.addLogin({ details: login, shareWith, sharePreviews });
    setSubmitted(true);
  };

  if (submitted) return <Redirect to="/" />;

  return (
    <EditLogin
      type={LoginType.RawCredentials}
      onSubmit={addLogin}
      sharePreviews
      friends={props.friends}
    />
  );
};

export const NewLoginPage: React.FC<{ app: LoadedApp }> = (props) => {
  const [friends, setFriends] = useState<TShareRecipient[]>([]);

  useEffect(() => {
    const loadFriends = async () =>
      setFriends(await props.app.api().getPotentialShares());

    loadFriends();
  }, []);

  return (
    <NewLogin
      addLogin={(data) =>
        props.app.addLogin({ ...data, type: LoginType.RawCredentials })
      }
      friends={friends}
    />
  );
};
