import * as React from "react";
import { AppContainer, LoadedApp } from "./AppContainer";
import { Signin } from "./Signin";
import { Subscribe } from "unstated";
import { BetaOnboardPage } from "./components/BetaOnboarding";
import { Page } from "./components/Page";
import { LoadingPage } from "./components/LoadingAnim";

export const AuthRequired = (props: {
  children: (app: LoadedApp) => JSX.Element;
  unauthenticatedView?: JSX.Element;
  app: AppContainer;
}) => {
  if (props.app.state.loading) return <LoadingPage />;

  if (props.app.state.kind === "app/unauthenticated") {
    return props.unauthenticatedView || <Signin app={props.app} />;
  }

  if (props.app.state.kind !== "app/loaded") return null;

  const loadedApp = props.app.assertLoaded();

  if (loadedApp.state.currentUser.isInBetaOnboarding)
    return (
      <Page>
        <BetaOnboardPage app={loadedApp} />
      </Page>
    );

  return props.children(loadedApp);
};
