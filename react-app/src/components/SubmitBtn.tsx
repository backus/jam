import styled from "styled-components/macro";

export const SubmitBtn = styled.button.attrs(() => ({
  type: "submit",
}))`
  border: 2px solid #ffffff;
  box-sizing: border-box;
  border-radius: 5px;
  outline: none;
  border: none;
  font-style: italic;
  font-weight: bold;
  font-size: 24px;
  line-height: 28px;
  align-items: center;
  text-align: center;
  opacity: 100%;
  padding: 5px;

  &:disabled {
    background-color: #c25cdc;
  }

  background-color: #f253cf;
  cursor: pointer;

  color: #ffffff;
`;
