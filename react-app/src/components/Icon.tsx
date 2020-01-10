import React, { useState } from "react";
import _ from "lodash";
import styled, { css } from "styled-components/macro";
import theme from "./../theme";
import { Image, ImageProps } from "rebass/styled-components";
import icons, { IconNames } from "./../icons";

type Props = Omit<ImageProps, "css" | "variant"> & {
  kind: IconNames;
};

export const Icon: React.FC<Props> = ({ kind, ...props }) => {
  return (
    <Image
      src={_.get(icons, kind)}
      {...props}
      sx={{
        ...props.sx,
      }}
    />
  );
};
