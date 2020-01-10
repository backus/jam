import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import styled, { css, keyframes } from "styled-components/macro";
import { Card } from "./Card";
import * as _ from "lodash";
import { Box, Link, BoxProps } from "rebass/styled-components";
import closeIconWhite from "./../img/close-button-white.svg";

interface ModalProps {
  onClose: () => void;
  noStyleContainer?: true;
  overlayBg?: string;
  fadeIn?: boolean;
  showCloseButton?: boolean;
  sx?: BoxProps["sx"];
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const OverlayBox = styled(Box)<{ isClosing: boolean; fadeInTime: string }>`
  animation: ${(props) => (props.isClosing ? fadeOut : fadeIn)}
    ${(props) => props.fadeInTime};
  opacity: ${(props) => (props.isClosing ? 0 : 1)};
`;

const CloseButton: React.FC<{ onClick: () => any }> = (props) => {
  return (
    <Box
      display="block"
      onClick={props.onClick}
      sx={{
        opacity: 0.5,
        backgroundImage: `url(${closeIconWhite})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        position: "absolute",
        top: 0,
        left: 0,
        cursor: "pointer",
        "&:hover": {
          opacity: 1,
          transition: "all 0.5s ease",
        },
        "@media screen and (max-width: 767px)": {
          height: "40px",
          width: "40px",
          padding: "20px",
          backgroundSize: "20px 20px",
        },
        "@media screen and (min-width: 768px)": {
          height: "60px",
          width: "60px",
          padding: "30px",
          backgroundSize: "30px 30px",
        },
      }}
    />
  );
};

export const Modal: React.FC<ModalProps> = (props) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalNode = document.getElementById("modal");
  if (!modalNode) throw new Error("Couldn't find modal DOM node?");

  const fadeInTime = props.fadeIn ? "0.5s" : "0";

  // Client caller should just handle this but 🤷‍♂️
  const containerStyles = props.noStyleContainer
    ? {}
    : {
        bg: "#fff",
        boxShadow: "4px 4px 15px rgba(0, 0, 0, 0.15)",
        borderRadius: "5px",
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        display: "flex",
        "@media screen and (max-width: 400px)": {
          width: "calc(100vw - 20px)",
        },
      };

  const overlayBg = props.overlayBg || "rgba(210, 158, 251, 0.75)";

  useEffect(() => {
    document.body.classList.add("modal-open");

    return () => document.body.classList.remove("modal-open");
  }, []);

  return ReactDOM.createPortal(
    <OverlayBox
      fadeInTime={fadeInTime}
      isClosing={isClosing}
      onAnimationEnd={() => isClosing && props.onClose()}
      id="modal-overlay"
      display="flex"
      width="100vw"
      height="100vh"
      sx={{
        background: overlayBg,
        overflowY: "scroll",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 30,
        justifyContent: "center",
      }}
      onClick={() => setIsClosing(true)}
    >
      {props.showCloseButton && (
        <CloseButton onClick={() => setIsClosing(true)} />
      )}

      <Box
        id="modal-container"
        sx={{ ...containerStyles, ...props.sx }}
        onClick={(ev) => ev.stopPropagation()}
      >
        {props.children}
      </Box>
    </OverlayBox>,
    modalNode
  );
};
