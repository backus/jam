import _ from "lodash";
import { LoginV1, Cookie } from "./types";
import { LoadedApp } from "./AppContainer";
import { AesEncryptedBlob } from "./api/graphql";
import { AppCrypto } from "./crypto";
import clientEnv from "./clientEnv";

const tlds: string[] = require("tld-list");

if (process.env.NODE_ENV === "development") tlds.push("localhost");

const mostRootDomainFor = (hostname: string): string => {
  if (hostname === "localhost") return hostname;
  const pattern = new RegExp("([^.]+\\.(?:" + tlds.join("|") + ")$)");
  const m = hostname.match(pattern);
  if (!m) throw new Error("No match on hostname?");
  return m[0];
};

interface IExportedStorage {
  localStorage: { [key: string]: string };
  sessionStorage: { [key: string]: string };
}

const reloadTab = async (tabId: number, options: { bypassCache: boolean }) =>
  new Promise((resolve, reject) => {
    chrome.tabs.reload(tabId, options, () =>
      chrome.runtime.lastError
        ? reject(chrome.runtime.lastError.message)
        : resolve()
    );
  });

const executeScript = async <T = never>(
  tabId: number,
  code: string
): Promise<T[]> => {
  return new Promise<T[]>((resolve, reject) =>
    chrome.tabs.executeScript(tabId, { code }, (result: T[]) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(result);
      }
    })
  );
};

class BrowserTab {
  private url: URL;

  static async create(url: string, options: { windowId: number }) {
    return new Promise<BrowserTab>((resolve, reject) =>
      chrome.tabs.create(
        { url, active: false, windowId: options.windowId },
        (tab) => {
          if (chrome.runtime.lastError)
            return reject(chrome.runtime.lastError.message);

          try {
            const browserTab = new BrowserTab(tab);
            resolve(browserTab);
          } catch (error) {
            reject(error);
          }
        }
      )
    );
  }

  /**
   * We need the windowId to be provided because `windows.getLastFocused` does not return the
   * correct value when the popup is open, so as a workaround we make sure to get it by other
   * means and then pass it around.
   *
   * @see https://bugs.chromium.org/p/chromium/issues/detail?id=546696
   */
  static async active(windowId: number) {
    return new Promise<BrowserTab>((resolve, reject) =>
      chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
        if (tabs.length > 1) return reject("Multiple active tabs?");
        if (tabs.length === 0) return reject("No active tab?");
        const tab = tabs[0];

        try {
          const browserTab = new BrowserTab(tab);
          resolve(browserTab);
        } catch (error) {
          reject(error);
        }
      })
    );
  }

  constructor(private tab: chrome.tabs.Tab) {
    const tabUrl = this.tab.url || this.tab.pendingUrl;

    if (!tabUrl)
      throw new Error("No URL found for tab? Are permissions set correctly?");

    this.url = new URL(tabUrl);
  }

  async siteName(): Promise<string | null> {
    const results = await this.executeScript(
      `document.querySelector('meta[property="og:site_name"]')?.content`
    );

    if (results.length < 1)
      throw new Error(
        "Expected one result from tabs.executeScript, found zero."
      );

    if (results.length > 1)
      throw new Error(
        "Expected one result from tabs.executeScript, found multiple. Are we injecting into multiple frames?"
      );

    const result = results[0];

    if (!result) {
      return null;
    } else if (_.isString(result)) {
      return result;
    } else {
      throw new Error(
        `Unexpected type from tab.siteName. Expected string | null, got: ${result}`
      );
    }
  }

  async highlight() {
    return new Promise((resolve, reject) =>
      chrome.tabs.highlight(
        { windowId: this.tab.windowId, tabs: [this.tab.index] },
        () =>
          chrome.runtime.lastError
            ? reject(chrome.runtime.lastError.message)
            : resolve(true)
      )
    );
  }

  async reload(options: { bypassCache: boolean } = { bypassCache: false }) {
    if (this.tab.id) {
      return reloadTab(this.tab.id, options);
    } else {
      throw new Error("Tab doesn't have an id?");
    }
  }

  async pageState() {
    const [cookies, storage] = await Promise.all([
      this.cookies(),
      this.storage(),
    ]);

    return new PageState(this.url.toString(), cookies, storage);
  }

  async overwriteState(pageState: PageState) {
    await (await this.pageState()).deleteAll();

    await pageState.setCookies(this.tab);
    await pageState.injectLocalStorage(this.tab);

    return true;
  }

  async storage() {
    const storage = await this.executeScript<{
      localStorage: [string, any][];
      sessionStorage: [string, any][];
    }>(`
      // If a website sets a value like "key" on localStorage, Object.entries(localStorage)
      // will stupidly provide the function at localStorage.key. So, we have to iterate over
      // the object instead and call getItem for each value
      function dumpStorage(storage) {
        return Object.keys(storage).map(key => [key, storage.getItem(key)]);
      }

      function readLocalStorage() {
        return {
          sessionStorage: dumpStorage(sessionStorage),
          localStorage: dumpStorage(localStorage),
        };
      }
    
      readLocalStorage();
    `);

    if (!storage) throw new Error("Failed to read local storage!");

    if (storage.length !== 1)
      throw new Error(
        "Expected one result, given we're not injecting into multiple frames?"
      );

    const { localStorage, sessionStorage } = storage[0];

    return {
      localStorage: Object.fromEntries(localStorage),
      sessionStorage: Object.fromEntries(sessionStorage),
    };
  }

  rootDomain() {
    return mostRootDomainFor(this.hostname());
  }

  windowId() {
    return this.tab.windowId;
  }

  isIncognito() {
    return this.tab.incognito;
  }

  hostname() {
    return this.url.hostname;
  }

  private async cookies() {
    return new Promise<chrome.cookies.Cookie[]>((resolve) => {
      chrome.cookies.getAll({ domain: this.rootDomain() }, function (cookies) {
        resolve(cookies);
      });
    });
  }

  private async executeScript<T = never>(code: string): Promise<T[]> {
    return executeScript(this.tab.id!, code);
  }
}

class PageState {
  static decode(data: string) {
    try {
      const decoded = decodeURIComponent(atob(data));
      const { url, cookies, localStorage } = JSON.parse(decoded);
      return new PageState(url, cookies, localStorage);
    } catch (error) {
      throw new Error("Failed to decode payload! " + error);
    }
  }

  constructor(
    public readonly url: string,
    public readonly cookies: chrome.cookies.Cookie[],
    private storage: IExportedStorage
  ) {}

  async deleteAll() {
    return Promise.all(
      this.cookies.map(
        (cookie) =>
          new Promise((resolve, reject) =>
            chrome.cookies.remove(
              {
                url: this.url,
                ..._.pick(cookie, ["name", "storeId"]),
              },
              (details) =>
                details ? resolve() : reject(`Failed to unset ${cookie.name}`)
            )
          )
      )
    );
  }

  async injectLocalStorage(tab: chrome.tabs.Tab) {
    await this.writeLocalStorageToExtensionStorage();

    return executeScript(
      tab.id!,
      `
        function writeLocalStorageFromExtension() {
          chrome.storage.local.get("@jam/storage", (items) => {
            localStorage.clear();
            const injectedStorage = items["@jam/storage"];
            if (!injectedStorage) throw new Error("Expected an object?");
        
            Object.keys(injectedStorage.localStorage).forEach((key) =>
              localStorage.setItem(key, injectedStorage.localStorage[key])
            );
        
            Object.keys(injectedStorage.sessionStorage).forEach((key) =>
              sessionStorage.setItem(key, injectedStorage.sessionStorage[key])
            );
          });
        }
          

        writeLocalStorageFromExtension();`
    );
  }

  async writeLocalStorageToExtensionStorage() {
    return new Promise((resolve, reject) =>
      chrome.storage.local.set({ "@jam/storage": this.storage }, () =>
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve()
      )
    );
  }

  /**
   * Detect if the session being extracted is an instance of Jam
   *
   * Avoid the Chrome extension extracting session information from a Jam web
   * instance by itself. Any Jam web instance will write a "@jam/identity" value
   * that contains what is essentially a proof that it is a Jam instance. It includes
   * a salt used to derive a subkey, an AesEncryptedBlob payload, and a random UUID input
   * value. Assuming the web page and the chrome extension are the same Jam user, then the
   * salt should derive to the same decryption key. As a result, the extension can check and
   * confirm that the web page is also a Jam instance.
   *
   * This technique prepares us for the future. Users could deploy their own Jam instance,
   * run it as an Electron app, run an alternative frontend, etc.
   */
  async isJamSession(crypto: AppCrypto) {
    const localStorage = this.localStorage();
    if (!("@jam/identity" in localStorage)) return false;

    let jamIdentity: { input: string; output: AesEncryptedBlob; salt: string };

    try {
      jamIdentity = JSON.parse(localStorage["@jam/identity"]);
      if (!jamIdentity.input || !jamIdentity.output || !jamIdentity.salt)
        return false;
    } catch (error) {
      return false;
    }

    try {
      return await crypto.verifySessionIdentity(jamIdentity);
    } catch (error) {
      clientEnv.bugsnag.notify(error);

      if (clientEnv.isDevelopment()) {
        throw error;
      } else {
        return false;
      }
    }
  }

  localStorage() {
    return this.storage.localStorage;
  }

  sessionStorage() {
    return this.storage.sessionStorage;
  }

  async setCookies(tab: chrome.tabs.Tab) {
    const pageStateUrl = new URL(this.url);

    return Promise.all(
      this.cookies.map(async (cookie) => {
        // The url specified for setting the cookie needs to be compatible with the rules
        // of the cookie. So, we just construct the URL based on the rules plus info from
        // the original page state url
        const setCookieUrl = `${pageStateUrl.protocol}//${
          cookie.domain.startsWith(".") ? cookie.domain.slice(1) : cookie.domain
        }${cookie.path}`;

        let cookieDetails = {
          url: setCookieUrl,
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
          expirationDate: cookie.expirationDate,
          storeId: tab.incognito ? "1" : "0",
        };

        return await setCookie(cookieDetails);
      })
    );
  }

  encodedData() {
    return btoa(encodeURIComponent(this.toJSON()));
  }

  toJSON() {
    return JSON.stringify(
      {
        url: this.url,
        cookies: this.cookies,
        storage: this.storage,
      },
      null,
      4
    );
  }
}

const setCookie = async (
  cookie: chrome.cookies.SetDetails
): Promise<chrome.cookies.Cookie> =>
  new Promise((resolve, reject) =>
    chrome.cookies.set(cookie, (details) => {
      if (chrome.runtime.lastError)
        return reject(chrome.runtime.lastError.message);
      if (!details)
        return reject(
          `Failed to set ${cookie.name}? No details provided to callback`
        );

      resolve(details);
    })
  );

export const injectBrowserState = async ({
  login,
  windowId,
}: {
  login: LoginV1;
  windowId: number;
}): Promise<boolean> => {
  if (!login.secret.browserState)
    throw new Error("Expected browser state login!");
  const {
    meta,
    cookies: unprocessedCookies,
    localStorage,
  } = login.secret.browserState!;

  const now = +new Date() / 1000;
  const oneYearFromNow =
    +new Date(new Date().setFullYear(new Date().getFullYear() + 1)) / 1000;

  // If a cookie is now expired, setting it will fail the whole operation.
  // Alter cookies to expire a year from now instead
  const cookies = unprocessedCookies.map((cookie) => {
    if (_.isUndefined(cookie.expirationDate) || cookie.expirationDate > now)
      return cookie;

    return { ...cookie, expirationDate: oneYearFromNow };
  });

  const pageState = new PageState(
    meta.extractionUrl,
    cookies as chrome.cookies.Cookie[],
    {
      localStorage,
      sessionStorage: {},
    }
  );

  const activeTab = await BrowserTab.active(windowId);
  const subjectTab = await BrowserTab.create(pageState.url, {
    windowId: activeTab.windowId(),
  });

  await subjectTab.overwriteState(pageState);
  await subjectTab.reload({ bypassCache: true });
  await subjectTab.highlight();

  return true;
};

export const extractBrowserState = async ({
  app,
  windowId,
}: {
  app: LoadedApp;
  windowId: number;
}): Promise<{ kind: "rejected" } | { kind: "success"; value: LoginV1 }> => {
  const tab = await BrowserTab.active(windowId);
  const tabPageState = await tab.pageState();

  if (await tabPageState.isJamSession(app.state.crypto)) {
    return { kind: "rejected" };
  }

  return {
    kind: "success",
    value: {
      info: {
        title: (await tab.siteName()) || tab.rootDomain(),
        domain: tab.rootDomain(),
      },
      detail: {},
      secret: {
        browserState: {
          meta: {
            extractionUrl: tabPageState.url,
          },
          cookies: tabPageState.cookies,
          localStorage: tabPageState.localStorage(),
          sessionStorage: tabPageState.sessionStorage(),
        },
      },
    },
  };
};
