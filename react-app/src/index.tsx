// browserslist doesn't automatically polyfill. See: https://git.io/JvpEq
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";

// polyfills for IE11 https://reactjs.org/docs/javascript-environment-requirements.html
import "core-js/es/map";
import "core-js/es/set";

import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import "./index.css";
import env from "./clientEnv";
import { App } from "./App";
import bugsnagReact from "@bugsnag/plugin-react";

env.bugsnag.use(bugsnagReact, React);

// wrap your entire app tree in the ErrorBoundary provided
const ErrorBoundary = env.bugsnag.getPlugin("react");

ReactDOM.render(
  <ErrorBoundary>
    <App env="web" />
  </ErrorBoundary>,
  document.getElementById("root")
);

try {
  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
} catch (error) {
  env.bugsnag.notify(error, { severity: "info" });
}
