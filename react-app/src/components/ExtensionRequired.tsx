import React, { useState, useEffect } from "react";
import _ from "lodash";
import { SimpleCard, InfoCard } from "./../components/Card";
import externalLinkImg from "./../img/external-link-white.svg";
import { Text, Flex, Box } from "rebass/styled-components";
import { Btn, ExternalLinkBtn } from "./../components/Button";
import { useCurrentBrowserEnv, BrowserEnv } from "../BrowserEnv";
import { Modal } from "./../components/Modal";
import { FloatingIcon } from "./../components/FloatingIcon";
import magicLinkHat from "./../img/magic-link.svg";
import chromeIcon from "./../img/chrome-icon.png";
import { LoadingSpinner } from "./../components/Loading";
import clientEnv from "../clientEnv";
import { Emoji } from "./Emoji";

const useExtensionListener = (
  chromeEnv: BrowserEnv,
  doneCallback: () => any
) => {
  const [active, setActive] = useState(false);
  const [intervalId, setIntervalId] = useState<null | ReturnType<
    typeof setInterval
  >>(null);

  const start = () => {
    setActive(true);
  };

  const stop = () => {
    setActive(false);

    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  useEffect(() => {
    if (active && !intervalId) {
      const interval = setInterval(async () => {
        const outcome = await chromeEnv.isChromeExtensionInstalled();

        if (outcome) {
          setActive(false);
          clearInterval(interval);
          setIntervalId(null);
          doneCallback();
        }
      }, 500);

      setIntervalId(interval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      setActive(false);
    };
  }, [active, intervalId, chromeEnv, doneCallback]);

  return [start, stop];
};

export const useExtensionAvailability = (): [boolean | null, () => void] => {
  const chromeEnv = useCurrentBrowserEnv();

  const [extensionInstalled, setExtensionInstalled] = useState<
    null | true | false
  >(null);

  const checkIfExtensionInstalled = async (env: BrowserEnv) => {
    if (env.isChromeExtension()) {
      setExtensionInstalled(true);
      return;
    }

    setExtensionInstalled(await env.isChromeExtensionInstalled());
  };

  useEffect(() => {
    checkIfExtensionInstalled(chromeEnv);
  }, [chromeEnv]);

  return [extensionInstalled, () => checkIfExtensionInstalled(chromeEnv)];
};

export const ExtensionRequired: React.FC<{
  onDismiss?: () => void;
  onReady: () => void;
  explanationForInstall: string;
}> = (props) => {
  const onDismiss = props.onDismiss || _.noop;
  const chromeEnv = useCurrentBrowserEnv();

  const [state, setState] = useState<
    "prompt" | "listening" | "installed" | "ready"
  >("prompt");

  const [startListener, stopListener] = useExtensionListener(chromeEnv, () =>
    setState("installed")
  );

  useEffect(() => {
    const authenticateExtension = async () => {
      await chromeEnv.shareAuthentication();
      setState("ready");
      props.onReady();
    };

    if (state === "installed") authenticateExtension();
  }, [state, chromeEnv, props]);

  if (state === "ready") return <>{props.children}</>;

  if (chromeEnv.isWebPage() && !chromeEnv.isDesktopBrowser()) {
    return (
      <InfoCard
        floatingIcon={
          <FloatingIcon img={chromeIcon} iconSize={107} size={107} />
        }
        title="Computers only 👩‍💻"
      >
        <Box maxWidth={300} mx="auto">
          <Text variant="info" as="p">
            Magic links don’t work with mobile browsers, for now.
          </Text>
          <Text variant="info" as="p" pt={24}>
            To {props.explanationForInstall}, open Jam on your computer using
            Google Chrome.
          </Text>
        </Box>
        <Btn
          variant="blue"
          fontSize={24}
          mx="auto"
          mt={26}
          mb={20}
          block
          onClick={onDismiss}
        >
          Got it <Emoji>👍</Emoji>
        </Btn>
      </InfoCard>
    );
  }

  if (chromeEnv.isWebPage() && !chromeEnv.isChromeExtensionSupported()) {
    return (
      <InfoCard
        floatingIcon={
          <FloatingIcon img={chromeIcon} iconSize={107} size={107} />
        }
        title="Chrome extension required"
      >
        <Box maxWidth={300} mx="auto">
          <Text variant="info" as="p">
            Jam’s browser extension lets you share accounts without sharing
            passwords. It only works with Chrome right now though!
          </Text>
          <Text variant="info" as="p" pt={24}>
            To {props.explanationForInstall}, log in to Jam in Google Chrome and
            open this page.
          </Text>
          <Text variant="info" as="p" pt={24}>
            If you don’t have Google Chrome, you can download it for free:
          </Text>
        </Box>
        <ExternalLinkBtn
          href="https://google.com/chrome"
          variant="blue"
          iconSize={21}
          fontSize={24}
          mx="auto"
          mt={26}
          mb={20}
        >
          Install Chrome
        </ExternalLinkBtn>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      floatingIcon={
        <FloatingIcon img={magicLinkHat} iconSize={82} size={107} />
      }
      title="Install Jam's browser extension"
    >
      <Box maxWidth={300} mx="auto">
        <Text variant="info" as="p">
          Jam’s extension lets you share accounts without sharing passwords.
        </Text>
        <Text variant="info" as="p" pt={24}>
          To {props.explanationForInstall}, please install the extension via the
          Chrome Web Store:
        </Text>
      </Box>
      <ExternalLinkBtn
        href={`https://chrome.google.com/webstore/detail/${clientEnv.chromeExtensionId}`}
        variant="blue"
        iconSize={21}
        fontSize={24}
        mx="auto"
        mt={26}
        mb={20}
        onClick={() => {
          setState("listening");
          startListener();
        }}
      >
        Install extension
      </ExternalLinkBtn>
      {(state === "listening" || state === "installed") && (
        <Text variant="detail" fontStyle="italic" textAlign="center">
          {state === "listening"
            ? "Listening for extension"
            : "Configuring extension"}{" "}
          {<LoadingSpinner ml="5px" width="10px" height="10px" />}
        </Text>
      )}
    </InfoCard>
  );
};
