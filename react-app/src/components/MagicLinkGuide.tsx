import React from "react";
import _ from "lodash";
import { SimpleCard } from "./Card";
import { Text, Box, Flex } from "rebass/styled-components";
import { useCurrentBrowserEnv } from "../BrowserEnv";
import {
  ExtensionRequired,
  useExtensionAvailability,
} from "./ExtensionRequired";
import { LoadingPage } from "./LoadingAnim";

const Step: React.FC<{ header: string; desc: string }> = (props) => {
  return (
    <Box mt="20px">
      <Text
        ml="20px"
        as="li"
        color="textInfo"
        fontWeight="medium"
        fontSize={18}
      >
        {props.header}
      </Text>
      <Text color="textDetail" mt="10px" lineHeight="1.53">
        {props.desc}
      </Text>
    </Box>
  );
};

export const MagicLinkGuide = () => {
  const [
    extensionInstalled,
    recheckExtensionAvailability,
  ] = useExtensionAvailability();

  if (_.isNull(extensionInstalled)) return <LoadingPage />;

  if (!extensionInstalled)
    return (
      <ExtensionRequired
        explanationForInstall="create a magic link"
        onReady={() => recheckExtensionAvailability()}
      />
    );

  return (
    <SimpleCard px={22} py={30}>
      <Text
        textAlign="center"
        fontWeight="bold"
        color="textPrimary"
        fontSize={20}
      >
        Let's create a Magic Link ✨
      </Text>
      <ol style={{ margin: 0, padding: 0 }}>
        <Step
          header="Open the site you want to share"
          desc="In a new tab, open the website for the account you want to share."
        />
        <Step
          header="Log in"
          desc="Make sure you’re logged in to the account you want to share with your friends"
        />
        <Step
          header="Click on Jam’s extension icon"
          desc="Your Jam dashboard should be displayed below the icon. The active tab in your browser should still be the website you want to share."
        />
        <Step
          header='Click "add a login" in the popup'
          desc='Select "Magic link" like you did before. Inside the extension, you’ll be able to give the login a title and save it to your account.'
        />
      </ol>
    </SimpleCard>
  );
};
