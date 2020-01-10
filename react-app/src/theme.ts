import checkImg from "./img/checkmark.svg";
import arrowImg from "./img/create-arrow.svg";
import backArrowImg from "./img/back-arrow.svg";
import trashCan from "./img/trash-can.svg";
import spinnerImg from "./img/spinner.gif";

export default {
  colors: {
    white: "#fff",
    griflan: {
      darkPurple: "#31115E",
      purple: "#4A148C",
      violet: "#AA00FF",
      pink: "#E040FB",
      turquoise: "#80DEEA",
      buttermilk: "#FFECB3",
    },
    pinks: {
      primary: "#F253CF",
      hover: "#f823c9",
      disabled: "#c25cdc",
    },
    blue: {
      primary: "#5389f2",
      hover: "#2868E4",
      disabled: "#3961AD",
    },
    lightPink: {
      primary: "#f253cf",
      hover: "#f823c9",
      disabled: "#c25cdc",
    },
    green: {
      primary: "#51C777",
      hover: "#2BE567",
      disabled: "#4CBE71",
      done: "#06b75a",
    },
    red: {
      primary: "#E3245D",
      hover: "#FF004C",
      disabled: "#DA4C76",
    },
    labelGrey: "#A5A8AC",
    textPrimary: "#555A60",
    textInfo: "#696D74",
    textDetail: "#A5A8AC",
  },
  variants: {
    icons: {
      back: {
        src: backArrowImg,
      },
    },
  },
  fontWeights: { medium: 500 },
  fonts: {
    body: "system-ui, sans-serif",
    heading: "azo-sans-web, sans-serif",
  },
  text: {
    smallHeader: {
      color: "textPrimary",
      fontWeight: 400,
      fontSize: "18px",
      lineHeight: "1.53",
    },
    info: {
      fontSize: "16px",
      color: "textInfo",
      lineHeight: "1.53",
    },
    detail: {
      fontSize: "14px",
      fontWeight: "normal",
      color: "textDetail",
      lineHeight: 1.53,
    },
  },
  shadows: {
    button: "0px 3px 1px rgba(0, 0, 0, 0.1)",
    buttonText: "0px 1px 1px rgba(0, 0, 0, 0.25);",
    card: "4px 4px 15px rgba(0, 0, 0, 0.25)",
  },
  buttons: {
    pink: {
      bg: "pinks.primary",
      ":hover": {
        bg: "pinks.hover",
      },
      ":disabled": {
        bg: "pinks.disabled",
      },
    },
    lightPink: {
      bg: "lightPink.primary",
      ":hover": {
        bg: "lightPink.hover",
      },
      ":disabled": {
        bg: "lightPink.disabled",
      },
    },
    blue: {
      bg: "blue.primary",
      ":hover": {
        bg: "blue.hover",
      },
      ":disabled": {
        bg: "blue.disabled",
      },
    },
    done: {
      bg: "green.done",
    },
    green: {
      bg: "green.primary",
      ":hover": {
        bg: "green.hover",
      },
      ":disabled": {
        bg: "green.disabled",
      },
    },
    red: {
      bg: "red.primary",
      ":hover": {
        bg: "red.hover",
      },
      ":disabled": {
        bg: "red.disabled",
      },
    },
  },
  forms: {
    input: {
      borderWidth: "2.5px",
      borderColor: "#F3F2F9",
      borderRadius: 5,
      py: "4px",
      pl: 10,
      variant: "text.info",
      outline: "none",
    },
    label: {
      color: "labelGrey",
      textTransform: "uppercase",
      fontSize: 10,
      fontWeight: "bold",
    },
    buttons: {
      primary: {
        background: "#ff0000",
      },
    },
    switch: {
      thumb: {
        background:
          "linear-gradient(144.62deg, #FFFFFF 16.65%, #F2F2F2 82.63%)",
      },
    },
  },
} as const;
