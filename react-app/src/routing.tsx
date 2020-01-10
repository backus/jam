import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  RouteProps,
  RouteChildrenProps,
  Link,
} from "react-router-dom";
import _ from "lodash";
import { Provider, Subscribe } from "unstated";
import { AppContainer } from "./AppContainer";
import { LoadingPage } from "./components/LoadingAnim";
import { Expand } from "./generics";

interface GuestRouteChildrenProps<T> extends RouteChildrenProps<T> {
  app: AppContainer;
}

type TGuestRouteProps<T = any> = Expand<
  Omit<RouteProps, "render" | "component" | "children"> & {
    userView: JSX.Element;
    children:
      | ((props: GuestRouteChildrenProps<T>) => React.ReactNode)
      | React.ReactNode;
    app: AppContainer;
  }
>;

export const GuestRoute: React.FC<TGuestRouteProps> = ({
  children,
  userView,
  app,
  ...rest
}) => (
  <Route
    {...rest}
    render={(routeProps) => {
      if (app.state.loading) return <LoadingPage />;

      if (app.state.kind === "app/unauthenticated") {
        return _.isFunction(children)
          ? children({ ...routeProps, app })
          : children;
      } else {
        return userView;
      }
    }}
  ></Route>
);
