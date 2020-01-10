import { ThemeProvider } from "styled-components/macro";
import { addDecorator } from "@storybook/react";
import React from "react";

import theme from "./../src/theme";
import { BrowserEnvProvider } from "./../src/BrowserEnv";

addDecorator((storyFn) => (
  <BrowserEnvProvider env="web">
    <ThemeProvider theme={theme}>{storyFn()}</ThemeProvider>
  </BrowserEnvProvider>
));
