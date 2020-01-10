import React from "react";
import spinner from "./../img/spinner.gif";
import spinnerBlack from "./../img/spinner-black.gif";
import { Image, ImageProps } from "rebass/styled-components";

type ImgProps = Omit<ImageProps, "css">;

export const LoadingSpinner = (
  props: ImgProps & { color?: "white" | "black" } = { color: "white" }
) => (
  <Image
    src={props.color === "white" ? spinner : spinnerBlack}
    role="presentation"
    {...props}
  />
);
