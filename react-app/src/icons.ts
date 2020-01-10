import _ from "lodash";

import checkImg from "./img/checkmark.svg";
import arrowImg from "./img/create-arrow.svg";
import backArrowImg from "./img/back-arrow.svg";
import trashCan from "./img/trash-can.svg";
import spinnerImg from "./img/spinner.gif";
import blackSpinnerImg from "./img/spinner-black.gif";
import copyIcon from "./img/copy-icon.svg";
import checkmark from "./img/checkmark.svg";
import approved from "./img/approved.svg";
import approvedWhite from "./img/approved-white.svg";
import invalid from "./img/invalid.svg";

// Compose a flat structure of icons so we can guarantee the type we export is always correct
const flatIcons = {
  back: backArrowImg,
  next: arrowImg,
  trash: trashCan,
  "spinner.white": spinnerImg,
  "spinner.black": blackSpinnerImg,
  checkmark,
  copy: copyIcon,
  "circledCheckmark.whiteOnGreen": approved,
  "circledCheckmark.greenOnWhite": approvedWhite,
  circledExclamation: invalid,
};

export type IconNames = keyof typeof flatIcons;

export default flatIcons;
