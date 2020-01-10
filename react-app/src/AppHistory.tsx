import React, { createContext, useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import _ from "lodash";

interface IAppHistory {
  history: ReturnType<typeof useHistory>;
  canGoBack: () => boolean;
}

const AppHistoryContext = createContext<IAppHistory | null>(null);

export const AppHistoryProvider: React.FC = (props) => {
  const [startingHistory, setStartingHistory] = useState<null | {
    length: number;
    action: string;
    location: { pathname: string };
  }>(null);

  /** The history object can have a length > 2 even on first page load,
   * so we pluck out these values so we can compare later to see if a
   * given history state is indeed the same state as the first page load
   */
  const pickHistoryValues = (h: ReturnType<typeof useHistory>) =>
    _.pick(h, ["length", "action", "location.pathname"]) as {
      length: number;
      action: string;
      location: { pathname: string };
    };

  const history = useHistory();
  const appHistory = {
    history,
    canGoBack: () =>
      !_.isNull(startingHistory) &&
      history.length !== 2 &&
      !_.isEqual(pickHistoryValues(history), startingHistory),
  };

  useEffect(() => {
    setStartingHistory(pickHistoryValues(history));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppHistoryContext.Provider value={appHistory}>
      {props.children}
    </AppHistoryContext.Provider>
  );
};

export const useAppHistory = () => {
  const value = useContext(AppHistoryContext);
  if (!value)
    throw new Error(
      "App history is null? Are we inside an AppHistoryProvider instance?"
    );

  return value;
};
