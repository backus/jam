import React, { useState } from "react";
import * as _ from "lodash";
import { ChangePassword } from "../components/ChangePassword";
import { LoadedApp } from "../AppContainer";
import { WithFlash } from "../Flash";
import { Redirect } from "react-router-dom";
import { toCreateAccountParams } from "../srp";
import { AppCrypto } from "../crypto";
import { useCurrentBrowserEnv } from "../BrowserEnv";

export const ChangePasswordPage: React.FC<{ app: LoadedApp }> = ({ app }) => {
  const { currentUser } = app.state;

  const [saved, setSaved] = useState(false);

  const browserEnv = useCurrentBrowserEnv();

  const handleSave = async (newPassword: string) => {
    const { params, masterKey: newMasterKey } = await toCreateAccountParams(
      currentUser.email,
      newPassword
    );
    const newAppCrypto = await AppCrypto.fromKeyMaterial(newMasterKey);
    const newWrappedPrivkey = await newAppCrypto.wrapPrivateKey(
      await currentUser.exportablePrivateKey()
    );

    await app.graphql().UpdatePassword({
      params: {
        encryptedPrivateKey: newWrappedPrivkey,
        ..._.pick(params, [
          "srpPbkdf2Salt",
          "masterKeyPbkdf2Salt",
          "srpSalt",
          "srpVerifier",
        ]),
      },
    });

    setSaved(true);

    await app.signOut();
    browserEnv.afterSignOut();
  };

  if (!currentUser.forcedPasswordChangeEnabled) return <Redirect to="/404" />;

  if (saved)
    return (
      <WithFlash message="Bam! Your password has been updated." kind="success">
        <Redirect to="/" />
      </WithFlash>
    );

  return <ChangePassword onSave={handleSave} />;
};
