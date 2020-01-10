import "../img/icon-16.png";
import "../img/icon-34.png";
import "../img/icon-48.png";
import "../img/icon-128.png";
import "../img/icon-16-dev.png";
import "../img/icon-34-dev.png";
import "../img/icon-48-dev.png";
import "../img/icon-128-dev.png";

import { injectBrowserState } from "@client/browserSession";
import clientEnv from "@client/clientEnv";
import { isError, isNumber } from "lodash";

const focusTab = async (id: number) =>
  new Promise<true>((resolve, reject) =>
    chrome.tabs.update(id, { active: true }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(true);
      }
    })
  );

const closeChromeStoreTab = async () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {
        url: `*://chrome.google.com/webstore/detail/*/${clientEnv.chromeExtensionId}`,
      },
      (tabs) => {
        Promise.all(
          tabs.map(
            (tab) =>
              new Promise((resolveTab, rejectTab) =>
                chrome.tabs.remove(tab.id!, () => {
                  if (chrome.runtime.lastError) {
                    rejectTab(chrome.runtime.lastError.message);
                  } else {
                    resolveTab(true);
                  }
                })
              )
          )
        )
          .then(() => resolve(true))
          .catch((error) => reject(error));
      }
    );
  });
};

const isApprovedExtensionSender = (
  sender: chrome.runtime.MessageSender
): boolean => {
  if (!sender.url) return false;

  return (
    new URL(sender.url).origin ===
    `chrome-extension://${clientEnv.chromeExtensionId}`
  );
};

const isApprovedExternalSender = (
  sender: chrome.runtime.MessageSender
): boolean => {
  if (!sender.url) return false;
  const url = new URL(sender.url!);

  return url.origin === clientEnv.backendHost.origin;
};

type ChromeExtensionMessageHandler = Parameters<
  chrome.runtime.ExtensionMessageEvent["addListener"]
>[0];

const handleMessage = async (
  msg: {
    action: "ping" | "injectBrowserState" | "shareAuthentication";
    data: any;
    windowId: number;
  },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (msg.action === "ping") {
    sendResponse({ success: true, data: "pong" });
    return;
  }

  if (msg.action === "injectBrowserState") {
    try {
      await injectBrowserState({ login: msg.data, windowId: msg.windowId });
      sendResponse({ success: true });

      // Empty string clears error
      chrome.browserAction.setBadgeText({ text: "" });
    } catch (error) {
      chrome.browserAction.setBadgeBackgroundColor({ color: "#E3245D" });
      chrome.browserAction.setBadgeText({ text: "Error!" });
      sendResponse({
        success: false,
        error: isError(error) ? error.message : error,
      });
    }

    return;
  }

  if (msg.action === "shareAuthentication") {
    Object.keys(msg.data).forEach((key) => (localStorage[key] = msg.data[key]));

    sendResponse({ success: true });

    if (sender.tab) {
      await focusTab(sender.tab.id!);
    } else {
      throw new Error("Unexpected state: No sending tab?");
    }

    await closeChromeStoreTab();

    return;
  }
  throw new Error("Received unexpected message? " + msg);
};

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (!isApprovedExtensionSender(sender)) return;

  /**
   * getLastFocused does not work properly in the background script, so we need internal message senders
   * to provide it as a workaround
   * @see https://bugs.chromium.org/p/chromium/issues/detail?id=546696
   **/
  if (!isNumber(msg.windowId))
    throw new Error(`Expected windowId to be provided with internal messages.`);

  await handleMessage(
    { action: msg.action, data: msg.data, windowId: msg.windowId },
    sender,
    sendResponse
  );
  return;
});

// Listen for simple "ping" message that web uses in order to check if the extension is installed
chrome.runtime.onMessageExternal.addListener(
  async (msg, sender, sendResponse) => {
    if (!isApprovedExternalSender(sender)) return;

    const windowId = sender.tab.windowId;

    /**
     * We rely on this to provide parity for our getLastFocused workaround.
     * @see https://bugs.chromium.org/p/chromium/issues/detail?id=546696
     */
    if (!isNumber(windowId))
      throw new Error("sender.tab.windowId not set for external message?");

    await handleMessage(
      { action: msg.action, data: msg.data, windowId: sender.tab.windowId },
      sender,
      sendResponse
    );
    return;
  }
);
