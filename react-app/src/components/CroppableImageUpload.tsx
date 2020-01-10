import * as React from "react";
import styled, { css, keyframes } from "styled-components/macro";
import { ImageUpload } from "./ImageUpload";
import { Modal } from "./Modal";
import { CropImg } from "./CropImg";
import { Emoji } from "./Emoji";
import { useKeyPress } from "./../useKeyPress";
import * as _ from "lodash";
import { ImageUploadProps } from "./ImageUpload";

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

interface AvatarUploadProps {
  onChange: (img: Blob) => void;
  email?: string;
}

export const CroppableImageUpload: React.FC<
  Omit<ImageUploadProps, "onImageChange"> & { onImageChange: (img: Img) => any }
> = (props) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [rawUpload, setRawUpload] = React.useState<string | null>(null);
  const escapePress = useKeyPress("Escape");

  const resetRawUpload = () => {
    if (inputRef.current) inputRef.current.value = "";
    setRawUpload(null);
  };

  const updateAvatar = async (img: Blob) => {
    const url = URL.createObjectURL(img);
    resetRawUpload();
    return props.onImageChange({ data: img, url });
  };

  if (escapePress && _.isString(rawUpload)) resetRawUpload();

  return (
    <>
      {_.isString(rawUpload) && (
        <Modal onClose={resetRawUpload}>
          <CropModal>
            <CropHeader>
              <strong>
                Lookin good <Emoji>😎</Emoji>
              </strong>
              <p>
                Crop your pic. Make sure to get your good side <Emoji>😉</Emoji>
              </p>
            </CropHeader>
            <CropImg
              src={rawUpload}
              width={256}
              onCropCompleted={(img) => updateAvatar(img)}
              onCancel={resetRawUpload}
            />
          </CropModal>
        </Modal>
      )}
      <ImageUpload
        {...props}
        inputRef={inputRef}
        onImageChange={(image) => setRawUpload(image)}
      />
    </>
  );
};
