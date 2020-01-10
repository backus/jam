import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter,
  MemoryRouter,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import "./index.css";
import { GuestRoute } from "./routing";
import { CreateAccount, CreateAccountBanner } from "./CreateAccount";
import { AcceptInvitePage } from "./AcceptInvite";
import { LoadLogin } from "./ViewLogin";
import { ViewLoginPreview } from "./ViewLoginPreview";
import { Card, SimpleCard } from "./components/Card";
import { Provider, Subscribe } from "unstated";
import { AppContainer } from "./AppContainer";
import styled, { ThemeProvider } from "styled-components/macro";
import { Signin, Subheading } from "./Signin";
import { AuthRequired } from "./AuthRequired";
import { AddFriend } from "./AddFriend";
import { NewLoginPage } from "./NewLogin";
import { NewMagicLinkPage } from "./pages/NewMagicLinkPage";
import { Page } from "./components/Page";
import { ViewNotifications } from "./components/ViewNotifications";
import { LocalStorageCheck } from "./components/LocalStorageCheck";
import { FindFriends } from "./FindFriends";
import { Home } from "./Home";
import { VerifyEmail } from "./VerifyEmail";
import { LandingPage } from "./LandingPage";
import { BetaInvitePage } from "./pages/BetaInvitePage";
import { ConfirmWaitlistPage } from "./pages/ConfirmWaitlistPage";
import { UnsubscribeWaitlistPage } from "./pages/UnsubscribeWaitlistPage";
import env from "./clientEnv";
import { TermsOfService } from "./TermsOfService";
import { FAQ } from "./FAQ";

import { addToBugsnagUser } from "./bugsnagUser";
import bugsnagReact from "@bugsnag/plugin-react";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { WithFlash } from "./Flash";
import theme from "./theme";
import { EditProfilePage } from "./pages/EditProfilePage";
import { BrowserEnvProvider } from "./BrowserEnv";
import { SelectNewLoginType } from "./components/SelectNewLoginType";
import { MagicLinkGuide } from "./components/MagicLinkGuide";
import { LoadingPage } from "./components/LoadingAnim";
import { NotFound } from "./components/NotFound";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { ViewFriendship } from "./components/ViewFriendship";
import { AppHistoryProvider } from "./AppHistory";

env.bugsnag.use(bugsnagReact, React);

// wrap your entire app tree in the ErrorBoundary provided
const ErrorBoundary = env.bugsnag.getPlugin("react");

export const NavCard = styled(Card)`
  padding: 0;
  width: fit-content;
  flex-direction: row;
  display: flex;
  overflow: hidden;
`;

const NavLink = styled(Link)`
  color: #424242;
  text-decoration: none;
  font-weight: bold;
`;

const Wrap = styled.div`
  margin: 0 auto;
  max-width: 400px;
`;

const Header = styled.div`
  position: relative;
  height: 36px;
  margin-bottom: 25px;
`;

const Title = styled.h2`
  font-weight: bold;
  font-size: 36px;
  line-height: 42px;

  color: #ffffff;
`;

export const App: React.FC<{
  env: "web" | "extension";
}> = (props) => {
  const Router = props.env === "web" ? BrowserRouter : MemoryRouter;

  return (
    <BrowserEnvProvider env={props.env}>
      <LocalStorageCheck>
        <Provider>
          <Subscribe to={[AppContainer]}>
            {(app: AppContainer) => (
              // @ts-expect-error
              <Router>
                <AppHistoryProvider>
                  <ThemeProvider theme={theme}>
                    <div>
                      <Switch>
                        <GuestRoute
                          app={app}
                          path="/signin"
                          userView={<Redirect to="/" />}
                        >
                          {({ app }) => (
                            <Page>
                              <Signin app={app} />
                            </Page>
                          )}
                        </GuestRoute>
                        <GuestRoute
                          app={app}
                          path="/waitlist/confirm/:id"
                          userView={<Redirect to="/" />}
                        >
                          {({ match }) => (
                            <Page>
                              <ConfirmWaitlistPage id={match!.params.id} />
                            </Page>
                          )}
                        </GuestRoute>
                        <GuestRoute
                          app={app}
                          path="/waitlist/unsubscribe/:id"
                          userView={<Redirect to="/" />}
                        >
                          {({ match }) => (
                            <Page>
                              <UnsubscribeWaitlistPage id={match!.params.id} />
                            </Page>
                          )}
                        </GuestRoute>
                        {!env.INVITE_ONLY && (
                          <GuestRoute
                            app={app}
                            path="/accounts/new"
                            userView={<Redirect to="/" />}
                          >
                            {({ app }) => (
                              <Page>
                                <CreateAccount
                                  app={app}
                                  heading={
                                    <>
                                      <CreateAccountBanner>
                                        Let's make you an account!
                                      </CreateAccountBanner>
                                      <Subheading>
                                        Done this already? Go{" "}
                                        <Link to="/signin">sign in</Link> then.
                                      </Subheading>
                                    </>
                                  }
                                />
                              </Page>
                            )}
                          </GuestRoute>
                        )}
                        <GuestRoute
                          app={app}
                          path="/beta/:id"
                          userView={<Redirect to="/" />}
                        >
                          {({ match }) => {
                            addToBugsnagUser({
                              beta: { id: match?.params.id },
                            });

                            return (
                              <Page>
                                <BetaInvitePage
                                  app={app}
                                  id={match?.params.id}
                                />
                              </Page>
                            );
                          }}
                        </GuestRoute>
                        {/* NOTE: Update key filter in index.html if this route changes! */}
                        <GuestRoute
                          app={app}
                          path="/invite/:id"
                          userView={
                            <WithFlash
                              kind="info"
                              message="You already have an account!"
                            >
                              <Redirect to="/" />
                            </WithFlash>
                          }
                        >
                          {({ match, history }) => {
                            let inviteKey: string | null = null;
                            // Catch errors since some people block access to invite key
                            try {
                              inviteKey = localStorage.getItem(
                                "@jam/invite-key"
                              );
                            } catch (error) {}

                            const key = (
                              inviteKey || history.location.hash
                            ).slice(1);

                            addToBugsnagUser({
                              invite: {
                                id: match?.params.id,
                                hasKey: key.length > 0,
                              },
                            });

                            return (
                              <AcceptInvitePage
                                loginKey={key !== "" ? key : null}
                                id={match?.params.id}
                                app={app}
                              />
                            );
                          }}
                        </GuestRoute>
                        <Route path="/me">
                          <AuthRequired app={app}>
                            {(app) => (
                              <Page>
                                <EditProfilePage app={app} />
                              </Page>
                            )}
                          </AuthRequired>
                        </Route>
                        <Route path="/change-password">
                          <AuthRequired app={app}>
                            {(app) => (
                              <Page>
                                <ChangePasswordPage app={app} />
                              </Page>
                            )}
                          </AuthRequired>
                        </Route>
                        <Route path="/friends">
                          <AuthRequired app={app}>
                            {(app) => (
                              <Page>
                                <FindFriends app={app} />
                              </Page>
                            )}
                          </AuthRequired>
                        </Route>
                        <Route path="/notifications">
                          <AuthRequired app={app}>
                            {(app) => (
                              <Page>
                                <Wrap>
                                  <Header>
                                    <Title>Notifications</Title>
                                    {/* <Notifications app={app} /> */}
                                  </Header>
                                  <ViewNotifications app={app} />
                                </Wrap>
                              </Page>
                            )}
                          </AuthRequired>
                        </Route>
                        <Route path="/logins/new">
                          {env.magicLinksEnabled ? (
                            <Page>
                              <SelectNewLoginType />
                            </Page>
                          ) : (
                            <Redirect to="/logins/credentials/new" />
                          )}
                        </Route>
                        <Route path="/logins/credentials/new">
                          <AuthRequired app={app}>
                            {(app) => (
                              <Page>
                                <NewLoginPage app={app} />
                              </Page>
                            )}
                          </AuthRequired>
                        </Route>
                        {env.magicLinksEnabled && (
                          <Route path="/logins/magic_link/new">
                            <AuthRequired app={app}>
                              {(app) => (
                                <Page>
                                  {props.env === "web" ? (
                                    <MagicLinkGuide />
                                  ) : (
                                    <NewMagicLinkPage app={app} />
                                  )}
                                </Page>
                              )}
                            </AuthRequired>
                          </Route>
                        )}
                        <Route
                          path="/login/:id/invite"
                          render={({ match }) => {
                            return (
                              <AuthRequired app={app}>
                                {(app) => (
                                  <Page>
                                    <AddFriend id={match.params.id} app={app} />
                                  </Page>
                                )}
                              </AuthRequired>
                            );
                          }}
                        />
                        <Route
                          path="/login/preview/:id"
                          render={({ match }) => {
                            return (
                              <AuthRequired app={app}>
                                {(app) => (
                                  <Page>
                                    <ViewLoginPreview
                                      id={match.params.id}
                                      app={app}
                                    />
                                  </Page>
                                )}
                              </AuthRequired>
                            );
                          }}
                        />
                        <Route
                          path="/login/:id"
                          render={({ match }) => {
                            return (
                              <AuthRequired app={app}>
                                {(app) => (
                                  <Page>
                                    <LoadLogin id={match.params.id} app={app} />
                                  </Page>
                                )}
                              </AuthRequired>
                            );
                          }}
                        />
                        <Route
                          path="/verify/:id"
                          render={({ match }) => {
                            return (
                              <Page>
                                <VerifyEmail app={app} id={match.params.id} />
                              </Page>
                            );
                          }}
                        />
                        <Route
                          path="/extensions/chrome"
                          render={() => {
                            window.location.href = env.chromeExtensionUrl();
                            return <LoadingPage />;
                          }}
                        />
                        <Route path="/privacy-policy">
                          <Page maxWidth="768px">
                            <PrivacyPolicy />
                          </Page>
                        </Route>
                        <Route path="/terms">
                          <Page maxWidth="768px">
                            <TermsOfService />
                          </Page>
                        </Route>
                        <Route path="/faq">
                          <Page maxWidth="768px">
                            <FAQ />
                          </Page>
                        </Route>
                        <Route exact path="/">
                          <AuthRequired
                            app={app}
                            unauthenticatedView={
                              <Page>
                                <LandingPage />
                              </Page>
                            }
                          >
                            {(app) => (
                              <Page>
                                <Home app={app} />
                              </Page>
                            )}
                          </AuthRequired>
                        </Route>

                        {/** At the end of our <Switch> routes, match modal-optional views and render nothing.
                         * After the switch is over, these routes are handled and they contain internal logic
                         * for conditionally-rendering inside of a modal
                         */}
                        <Route path="/friend/:id" />
                        <Route>
                          <Page>
                            <NotFound />
                          </Page>
                        </Route>
                      </Switch>

                      <Route
                        exact
                        path="/friend/:id"
                        render={({ match }) => (
                          <AuthRequired
                            app={app}
                            unauthenticatedView={
                              <Page>
                                <LandingPage />
                              </Page>
                            }
                          >
                            {(app) => (
                              <ViewFriendship
                                app={app}
                                friendId={match!.params.id}
                              />
                            )}
                          </AuthRequired>
                        )}
                      />
                    </div>
                  </ThemeProvider>
                </AppHistoryProvider>
              </Router>
            )}
          </Subscribe>
        </Provider>
      </LocalStorageCheck>
    </BrowserEnvProvider>
  );
};
