import React from "react";
import { Box } from "rebass/styled-components";

export const FloatingIcon: React.FC<{
  img: string;
  iconSize: number;
  size?: number;
}> = (props) => {
  const size = props.size || props.iconSize * 2;

  return (
    <Box
      mt={-(size / 2)}
      mb={0}
      mx="auto"
      height={`${size}px`}
      width={`${size}px`}
      sx={{
        borderRadius: "50%",
        border: "2px solid white",
        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.25)",
        background: `url(${props.img}), linear-gradient(150.3deg, #f56ff8 11.57%, #e36fd8 87.53%)`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: `${props.iconSize}px, contain`,
      }}
    />
  );
};
