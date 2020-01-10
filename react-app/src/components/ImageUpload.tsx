import React, { useRef } from "react";
import { Box, BoxProps } from "rebass/styled-components";
import { Input } from "@rebass/forms/styled-components";

const supportedFileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/gif",
  "image/png",
];

export type ImageUploadProps = {
  onImageChange: (image: string | null) => any;
  onDragAndDropStart?: () => void;
  onDragAndDropEnd?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
} & Omit<BoxProps, "css">;

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageChange,
  inputRef: maybeInputRef,
  ...props
}) => {
  // eslint-disable-next-line
  const inputRef = maybeInputRef || useRef<HTMLInputElement>();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files || files.length === 0) return;

    onImageChange(URL.createObjectURL(files[0]));
  };

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      onDragLeave={() => props.onDragAndDropEnd && props.onDragAndDropEnd()}
      onDragEnter={() => props.onDragAndDropStart && props.onDragAndDropStart()}
      onDrop={(event) => {
        event.stopPropagation();
        event.preventDefault();
        if (props.onDragAndDropEnd) props.onDragAndDropEnd();

        const files = event.dataTransfer.files;
        if (!files || files.length === 0) return;
        if (!supportedFileTypes.includes(files[0].type)) return;
        onImageChange(URL.createObjectURL(files[0]));
      }}
      onDragOver={(event) => {
        // Preventing default so that, when drag is released, browser doesn't just render the image
        event.preventDefault();
        if (props.onDragAndDropStart) props.onDragAndDropStart();
      }}
      {...props}
      sx={{ cursor: "pointer", ...props.sx }}
    >
      <Input
        type="file"
        accept={supportedFileTypes.join(", ")}
        ref={inputRef}
        onChange={handleInputChange}
        sx={{ position: "absolute", left: "-10000px", opacity: 0 }}
      />
      {props.children}
    </Box>
  );
};
