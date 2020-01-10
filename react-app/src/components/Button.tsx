import React, { useState } from "react";
import checkImg from "./../img/checkmark.svg";
import { Image, Button, ButtonProps } from "rebass/styled-components";
import icons from "./../icons";
import externalLinkImg from "./../img/external-link-white.svg";

type BtnProps = Omit<ButtonProps, "css"> & {
  block?: true;
  variant: NonNullable<ButtonProps["variant"]>;
};

export const Btn: React.FC<BtnProps> = (props) => {
  return (
    <Button
      {...props}
      sx={{
        width: props.block ? "100%" : "auto",
        fontWeight: "bold",
        fontStyle: "italic",
        textShadow: "buttonText",
        boxShadow: "button",
        py: "12px",
        px: "14px",
        cursor: "pointer",
        outline: "none",
        transition: "all 0.1s ease-in",
        ":disabled": {
          cursor: "not-allowed",
        },
        ...props.sx,
      }}
    >
      {props.children}
    </Button>
  );
};

type IconBtnProps = BtnProps & { icon: keyof typeof icons; iconSize: string };

export const IconBtn: React.FC<IconBtnProps> = ({
  icon,
  iconSize,
  ...props
}) => {
  return (
    <Btn
      {...props}
      sx={{
        backgroundImage: `url(${icons[icon]})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: iconSize,
        ...props.sx,
      }}
    >
      {props.children}
    </Btn>
  );
};

export const ExternalLinkBtn: React.FC<BtnProps & { iconSize: number }> = ({
  iconSize,
  ...props
}) => (
  <Btn
    as="a"
    target="_blank"
    sx={{
      backgroundImage: `url(${externalLinkImg})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center right 25px",
      backgroundSize: `${iconSize}px`,
    }}
    pr={25 + iconSize + 12} // icon is offset from right by 25px, then we account for it's width, then there should be 12px space from the text
    pl={25} // same padding as spacing from icon to button edge
    {...props}
  >
    {props.children}
  </Btn>
);

export const DoneBtn: React.FC<Omit<BtnProps, "variant">> = (props) => (
  <Btn variant="done" {...props} sx={{ cursor: "default", ...props.sx }}>
    <Image src={checkImg} mr="3px" width="13.5px" height="12.3px" />
    {props.children}
  </Btn>
);
