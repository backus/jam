import * as React from "react";
import * as ReactDOM from "react-dom";
import { Box } from "rebass/styled-components";

import { App } from "@client/App";

ReactDOM.render(
  <Box width="420px" height="100%" minHeight={600}>
    <App env="extension" />
  </Box>,
  document.getElementById("popup-root")
);
