import React, { useState, useEffect } from "react";
import { EditProfile } from "../components/EditProfile";
import { LoadedApp } from "../AppContainer";
import { PublicApi } from "../api";
import clientEnv from "../clientEnv";
import { WithFlash } from "../Flash";
import { Redirect } from "react-router-dom";

export const EditProfilePage: React.FC<{ app: LoadedApp }> = ({ app }) => {
  const { currentUser } = app.state;
  const publicApi = new PublicApi();

  const [saved, setSaved] = useState(false);

  const handleSave = async (changes: { avatar?: Blob; username?: string }) => {
    let avatarUrl: null | string = null;
    if (changes.avatar) {
      const outcome = await publicApi.getAvatarUploadUrl();

      if (outcome.kind !== "Success") {
        clientEnv.bugsnag.notify("Error creating avatar upload url!");
        return;
      }

      avatarUrl = outcome.data.avatarUrl;

      await fetch(outcome.data.uploadUrl, {
        method: "PUT",
        body: changes.avatar,
      });
    }

    await app
      .api()
      .updateAccount({ avatarUrl, username: changes.username || null });

    app.reloadMe();

    setSaved(true);

    return true;
  };

  if (saved)
    return (
      <WithFlash message="Bam! Changes saved." kind="success">
        <Redirect to="/" />
      </WithFlash>
    );

  return (
    <EditProfile
      avatarUrl={currentUser.avatarUrl}
      email={currentUser.email}
      username={currentUser.username}
      checkIsUsernameAvailable={(username) =>
        publicApi.isUsernameAvailable(username)
      }
      onSave={handleSave}
    />
  );
};
