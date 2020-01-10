import React from "react";
import clientEnv from "./clientEnv";
import { Image, ImageProps } from "rebass/styled-components";

type SizeProps =
  | {
      width: string;
      height: string;
      circle?: undefined | false;
      size?: undefined;
    }
  | {
      width?: undefined;
      height?: undefined;
      circle: true;
      size: string;
    };

type Props = SizeProps & { uri: string } & Omit<
    ImageProps,
    "css" | "width" | "height" | "circle" | "size"
  >;

export const Avatar: React.FC<Props> = ({
  uri,
  circle,
  size,
  width,
  height,
  sx: origSx,
  ...imgProps
}) => {
  const absoluteUrl = clientEnv.absolutePath(uri);
  let sx = { ...origSx };
  let dim: { width: string; height: string };

  if (circle) {
    if (!size) throw new Error("Size should be defined when circle specified");
    dim = { width: size, height: size };
    sx = { ...sx, borderRadius: "50%" };
  } else {
    if (!width || !height)
      throw new Error(
        "If circle isn't specified, width and height must be provided"
      );
    dim = { width, height };
  }

  if (uri === "/img/no-avatar.png") {
    return (
      <Image
        src={absoluteUrl}
        srcSet={`${absoluteUrl}, ${clientEnv.absolutePath(
          "/img/2x/no-avatar.png"
        )} 2x`}
        {...dim}
        {...imgProps}
        sx={sx}
      />
    );
  } else {
    return <Image src={absoluteUrl} {...imgProps} {...dim} sx={sx} />;
  }
};
