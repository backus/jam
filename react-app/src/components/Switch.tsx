import React, { useState, forwardRef } from "react";
import _ from "lodash";
import { Box, BoxProps } from "rebass/styled-components";
import { keyframes } from "styled-components/macro";

type SwitchProps = Omit<BoxProps, "css"> & {
  width?: string;
  height?: string;
  buttonSize?: string;
};

const sizeDefaults = {
  width: "110px",
  height: "50px",
  buttonSize: "45px",
};

const pxToNum = (px: string) => _.toNumber(px.replace(/px$/, ""));

/**
 * This is mostly just the source of the Rebass <Switch /> component, but I inlined
 * it because it wasn't easy to change the dimensions
 */
export const Switch: React.FC<SwitchProps> = ({ checked, ...props }) => {
  _.defaults(props, sizeDefaults);

  const translateX =
    _.toString(pxToNum(props.width!) - pxToNum(props.height!)) + "px";

  return (
    <Box
      as="button"
      type="button"
      role="switch"
      color="green.primary"
      aria-checked={checked}
      width={props.width}
      minWidth={props.width}
      height={props.height}
      {...props}
      sx={{
        cursor: "pointer",
        appearance: "none",
        m: 0,
        p: 0,
        borderRadius: "9999px",
        border: "1px solid",
        bg: "transparent",
        "&[aria-checked=true]": {
          bg: "green.primary",
          borderColor: "greens.primary",
        },
        "&[aria-checked=false]": {
          bg: "#DBDBE0",
          color: "#DBDBE0",
        },
        ":focus": {
          outline: "none",
        },
      }}
    >
      <Box
        aria-hidden
        style={{
          transform: checked ? `translateX(${translateX})` : "translateX(3.5%)",
        }}
        sx={{
          width: props.buttonSize,
          height: props.buttonSize,
          borderRadius: 9999,
          bg: "background",
          transitionProperty: "transform",
          transitionTimingFunction: "ease-out",
          transitionDuration: "0.1s",
          variant: "forms.switch.thumb",
        }}
      />
    </Box>
  );
};
