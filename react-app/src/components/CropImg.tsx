import * as React from "react";
import { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import styled, { css } from "styled-components/macro";
import { SubmitBtn } from "./SubmitBtn";
import { useKeyPress } from "./../useKeyPress";

const Wrap = styled.div<{ width: number }>`
  ${(props) =>
    css`
      width: ${props.width}px;
    `}
  display: flex;
  flex-direction: column;
`;

const ActionBtn = styled(SubmitBtn)<{
  color?: "pink" | "blue";
}>`
  background-color: #f253cf;
  box-shadow: 0px 3px 1px rgba(0, 0, 0, 0.1);
  color: #ffffff;
  cursor: pointer;
  font-size: 16px;
  line-height: 28px;
  margin-left: 5%;
  margin-top: 15px;
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
  width: 47.5%;

  &:disabled {
    background-color: #c25cdc;
  }

  & span {
    font-style: normal;
  }

  ${(props) =>
    props.color === "blue" &&
    css`
      background-color: #5389f2;
    `}

  &:first-child {
    margin-left: 0;
  }
`;

ActionBtn.defaultProps = { color: "pink" };

const Btns = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 40px;
  margin-bottom: 20px;
`;

export const CropImg = (props: {
  src: string;
  width: number;
  onCropCompleted: (img: Blob) => void;
  onCancel: () => void;
}) => {
  const [crop, setCrop] = useState<ReactCrop.Crop>({
    aspect: 1 / 1,
    width: 75,
    height: 75,
    x: 12.5,
    y: 12.5,
    unit: "%",
  });

  const enterPress = useKeyPress("Enter", { preventDefault: true });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const done = async () => {
    if (!image) return;
    setSubmitting(true);
    const exported = await exportImg(image, crop);
    props.onCropCompleted(exported);
  };

  const exportImg = (image: HTMLImageElement, crop: ReactCrop.Crop) => {
    const validateCrop = (
      crop: ReactCrop.Crop
    ): crop is ReactCrop.Crop &
      Required<Pick<ReactCrop.Crop, "width" | "height" | "x" | "y">> => {
      if (typeof crop.width !== "number") throw new Error("wtf");
      if (typeof crop.height !== "number") throw new Error("wtf");
      if (typeof crop.x !== "number") throw new Error("wtf");
      if (typeof crop.y !== "number") throw new Error("wtf");
      return true;
    };

    if (!validateCrop(crop)) throw new Error("wtf");
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("wtf");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // As a blob
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error("Blob is null??");
          (blob as any).name = "avatar.jpg";
          resolve(blob);
        },
        "image/jpeg",
        1
      );
    });
  };

  if (enterPress && !submitting && image) done();

  return (
    <Wrap width={props.width * 1.2}>
      <div style={{ width: props.width, margin: "0 auto" }}>
        <ReactCrop
          src={props.src}
          imageStyle={{ width: `${props.width}px` }}
          onChange={(newCrop) => setCrop(newCrop)}
          crop={crop}
          onImageLoaded={setImage}
        />
      </div>
      <Btns>
        <ActionBtn
          disabled={submitting}
          color="blue"
          onClick={() => props.onCancel()}
        >
          {" "}
          <span>😰</span> Nevermind
        </ActionBtn>
        <ActionBtn disabled={submitting} onClick={done}>
          {" "}
          <span>🔥</span> Done
        </ActionBtn>
      </Btns>
    </Wrap>
  );
};
