import React, { useEffect } from "react";
import { lighten } from "polished";
import styled, { css, keyframes } from "styled-components/macro";
import cameraIcon from "./../img/camera-icon.svg";
import cameraIconHover from "./../img/camera-icon-hover.svg";
import { ImageUpload } from "./ImageUpload";
import { Modal } from "./Modal";
import { CropImg } from "./CropImg";
import { Emoji } from "./Emoji";
import { useKeyPress } from "./../useKeyPress";
import * as _ from "lodash";
import { CroppableImageUpload } from "./CroppableImageUpload";
import { BoxProps } from "rebass/styled-components";
import clientEnv from "./../clientEnv";

const md5 = require("blueimp-md5");

const inputInvalidAnim = keyframes`{
  from {
    box-shadow: 0 0 10px rgba(243, 60, 60, 1);
    border-color: rgba(243, 60, 60, 0.5);
    background: rgba(243, 60, 60, 0.75);
  }

  10% {
    box-shadow: 0 0 10px rgba(243, 60, 60, 1);
    border-color: rgba(243, 60, 60, 1);
    background: rgba(243, 60, 60, 0.75);
  }

  to {
    box-shadow: none;
    background: linear-gradient(
      98.08deg,
      #8972eb 3.12%,
      #7f76e7 100.53%
    );
    border-color: #EDCBFB;
  }
}`;

const FileUpload = styled(CroppableImageUpload)<{
  error: boolean;
  avatar: string | undefined;
  dragAndDrop: boolean;
}>`
  border: 2px solid #EDCBFB;
  box-sizing: border-box;
  border-radius: 5px;
  width: 90%;
  margin: 0 auto;
  height: 60px;
  width: 60px;
  outline: none;

  font-weight: bold;
  font-size: 20px;
  color: #ffffff;

  ${(props) =>
    props.dragAndDrop &&
    css`
      border-color: white;
    `}

  ${(props) =>
    _.isString(props.avatar)
      ? css`
          background-image: url(${clientEnv.absolutePath(props.avatar)});
          background-size: cover;
          background-repeat: no-repeat;
        `
      : css`
          background-image: url(${props.dragAndDrop
            ? cameraIconHover
            : cameraIcon});
          background-color: #5d248c;
          background-size: 25px, cover;
          background-repeat: no-repeat;
          background-position: center;
        `}

  ${(props) =>
    props.error
      ? css`
          animation: ${inputInvalidAnim} 2s;
          animation-iteration-count: 1;
        `
      : ""}
  box-sizing: border-box;
  border-radius: 5px;
  margin: 0 auto;
  height: 60px;
  outline: none;

  text-indent: 20px;
  font-weight: bold;
  font-size: 20px;

  cursor: pointer;

  &:hover {
    cursor: pointer;
  }

  & input[type="file"] {
    position: absolute;
    left: -10000px;
    opacity: 0;
  }
`;

interface Img {
  url: string;
  data: Blob;
}

const CropHeader = styled.div`
  display: flex;
  flex-direction: column;

  margin-top: 20px;
  margin-bottom: 10px;

  & > strong,
  p {
    width: 100%;
    text-align: center;
  }

  & > strong {
    text-align: center;
    font-size: 24px;
    line-height: 28px;
    font-weight: bold;

    color: #2c3c55;

    flex: none;
    order: 0;
    align-self: flex-start;
  }

  & > p {
    font-style: italic;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    text-align: center;

    color: #6981a5;
  }
`;

const CropModal = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 25px;
`;

type AvatarUploadProps = {
  onChange: (img: Blob | null) => void;
  email?: string;
} & Omit<BoxProps, "css">;

const supportedFileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/gif",
  "image/png",
];

export const AvatarUpload: React.FC<AvatarUploadProps> = (props) => {
  const inputRef = React.createRef<HTMLInputElement>();
  const [avatar, setAvatar] = React.useState<Img | null>(null);
  const [dragAndDrop, setDragAndDrop] = React.useState(false);
  const htmlProps = _.omit(props, ["onChange", "email"]);

  React.useEffect(() => {
    const getGravatarUrl = async (email: string) => {
      const digest = md5(email.trim().toLowerCase());
      const url = `https://gravatar.com/avatar/${digest}.png?size=250&d=404`;
      const response = await fetch(url);
      if (response.status === 404) return;

      const img = await response.blob();
      const objUrl = URL.createObjectURL(img);
      setAvatar({ data: img, url: objUrl });
    };

    if (avatar || !props.email) return;

    getGravatarUrl(props.email);
  }, [props.email]);

  useEffect(() => {
    props.onChange(avatar?.data || null);
  }, [avatar]);

  return (
    <FileUpload
      {...htmlProps}
      data-jam-analyze="file-upload/avatar"
      avatar={avatar?.url}
      error={false}
      dragAndDrop={dragAndDrop}
      onDragAndDropStart={() => setDragAndDrop(true)}
      onDragAndDropEnd={() => setDragAndDrop(false)}
      onImageChange={(image: Img) => setAvatar(image)}
    />
  );
};
