import React, { createContext, useContext } from "react";
import _ from "lodash";
import env from "./clientEnv";
import { UAParser } from "ua-parser-js";
import { LoginV1 } from "./types";
import { injectBrowserState, extractBrowserState } from "./browserSession";
import { LoadedApp } from "./AppContainer";

export class WebPageEnv {
  isWebPage() {
    return true;
  }

  isChromeExtension() {
    return false;
  }

  afterSignOut() {
    // Trigger a hard refresh so the server is able to send the Griflan lander
    window.location.pathname = "/";
  }

  async extractBrowserState(
    app: LoadedApp
  ): ReturnType<typeof extractBrowserState> {
    throw new Error("Can't extract browser state from web paage");
  }

  async injectBrowserState(login: LoginV1) {
    const outcome:
      | { success: true }
      | { success: false; error: string } = await this.sendMessageToExtension({
      action: "injectBrowserState",
      data: login,
    });

    if (outcome.success === true) {
      return true;
    } else {
      throw new Error(outcome.error);
    }
  }

  isChromeExtensionSupported() {
    return !_.isUndefined(window?.chrome);
  }

  isDesktopBrowser() {
    // Return values for `getDevice().type` can be one of: "console" | "mobile" | "tablet" | "smarttv" | "wearable" | "embedded" | undefined
    // Using Chrome and Firefox on macOS, it returns undefined. So, I'm treating undefined as the desktop value.
    return _.isUndefined(new UAParser().getDevice().type);
  }

  async isChromeExtensionInstalled() {
    try {
      await this.messageExtension({ action: "ping" });
      return true;
    } catch (error) {
      return false;
    }
  }

  async shareAuthentication() {
    return this.sendMessageToExtension({
      action: "shareAuthentication",
      data: Object.fromEntries(Object.entries(localStorage)),
    });
  }

  async sendMessageToExtension(props: {
    action: string;
    data: any;
  }): Promise<any> {
    return this.messageExtension(props);
  }

  async messageExtension<T = {}>(data: {
    action: string;
    data?: any;
  }): Promise<T> {
    return new Promise<T>((resolve, reject) =>
      chrome.runtime.sendMessage(env.chromeExtensionId, data, (response) =>
        chrome.runtime.lastError
          ? reject(chrome.runtime.lastError.message)
          : resolve(response)
      )
    );
  }
}

class ChromeExtensionEnv {
  private port: chrome.runtime.Port;

  constructor() {
    this.port = chrome.runtime.connect();
  }

  isWebPage() {
    return false;
  }

  isChromeExtension() {
    return true;
  }

  // noop
  afterSignOut() {}

  async currentWindowId() {
    return new Promise<number>((resolve, reject) =>
      chrome.windows.getCurrent((window) =>
        chrome.runtime.lastError
          ? reject(chrome.runtime.lastError.message)
          : resolve(window.id)
      )
    );
  }

  async extractBrowserState(
    app: LoadedApp
  ): ReturnType<typeof extractBrowserState> {
    const windowId = await this.currentWindowId();
    return extractBrowserState({ app, windowId });
  }

  async injectBrowserState(login: LoginV1) {
    try {
      const outcome:
        | { success: true }
        | { success: false; error: string } = await this.sendMessageToExtension(
        {
          action: "injectBrowserState",
          data: login,
        }
      );
      if (outcome.success === true) {
        return true;
      } else {
        throw new Error(outcome.error);
      }
    } catch (error) {
      // This error is thrown if the user closes the popup before the background script responds.
      // We're fine with this for now. It doesn't break the session injection. With that said, we
      // should eventually inject some sort of UI element into the newly opened tab so the user
      // can confirm whether the injection worked if they do close the popup
      if (error === "The message port closed before a response was received.")
        return;

      throw error;
    }
  }

  isChromeExtensionSupported() {
    throw new Error("Redundant env check");
  }

  isDesktopBrowser() {
    throw new Error("Nonsense env check");
  }

  async isChromeExtensionInstalled(): Promise<boolean> {
    throw new Error("Redundant env check");
  }

  async sendMessageToExtension(props: {
    action: string;
    data: any;
  }): Promise<any> {
    const windowId = await this.currentWindowId();
    return this.messageExtension({ ...props, windowId });
  }
  async messageExtension<T = {}>(data: {
    action: string;
    data?: any;
    windowId: number;
  }): Promise<T> {
    return new Promise<T>((resolve, reject) =>
      chrome.runtime.sendMessage(data, (response) =>
        chrome.runtime.lastError
          ? reject(chrome.runtime.lastError.message)
          : resolve(response)
      )
    );
  }

  async shareAuthentication() {
    throw new Error("Invalid in chrome extension");
  }
}

export type BrowserEnv = WebPageEnv | ChromeExtensionEnv;

/**
 * @note You shouldn't need to import this outside of storybook and tests
 */
export const BrowserEnvContext = createContext<BrowserEnv | null>(null);

export const useCurrentBrowserEnv = (): BrowserEnv => {
  const value = useContext(BrowserEnvContext);
  if (!value)
    throw new Error(
      "Unknown browser environment! A provider should be specified as a parent somewhere in the tree"
    );

  return value;
};

export const BrowserEnvProvider: React.FC<{
  env: "web" | "extension";
}> = (props) => {
  const env = props.env === "web" ? new WebPageEnv() : new ChromeExtensionEnv();

  return (
    <BrowserEnvContext.Provider value={env}>
      {props.children}
    </BrowserEnvContext.Provider>
  );
};
