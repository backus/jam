import React from "react";
import * as _ from "lodash";
import { Field } from "react-final-form";
import styled from "styled-components/macro";

const Wrapper = styled.div`
  display: flex;
  color: red;

  text-align: left;
  flex-direction: column;

  border-bottom: 0.5px solid #ccc;

  padding: 0px;
  padding-bottom: 10px;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.label`
  width: 250px;
  padding: 5px;
  margin: 0;
  position: static;
  left: 0%;
  right: 0%;
  top: 4.76%;
  bottom: 66.67%;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 12px;

  /* identical to box height */

  font-variant: small-caps;
  color: rgba(44, 60, 85, 0.4);
  float: left;
`;

const Input = styled.input`
  border: none;
  display: block;
  font-size: 18px;
  height: 30px;
  margin: 0;
  outline: none;
  padding: 5px;
  width: 250px;
`;

const StyledField = styled(Field)`
  border: none;
  display: block;
  font-size: 18px;
  height: 30px;
  margin: 0;
  outline: none;
  padding: 5px;
  width: 250px;
`;

export function LabeledInput({
  type,
  name,
  value,
  onChange,
  last,
}: {
  type: "text" | "password";
  name: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  last?: true;
}) {
  if (!onChange) onChange = _.noop;

  return (
    <Wrapper>
      <Label htmlFor={name}>{name}</Label>
      <Input
        autoCapitalize="off"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
      />
    </Wrapper>
  );
}

export function LabeledInputField(
  props: {
    type: "text" | "password";
    name: string;
    last?: true;
  } & Parameters<typeof Field>[0]
) {
  return (
    <Wrapper>
      <Label htmlFor={props.name}>{props.name}</Label>
      <StyledField {...props} />
    </Wrapper>
  );
}

export const SubmitButton = styled.input.attrs((props) => ({
  type: "submit",
}))`
  border: none;
  background-color: #f96b93;
  font-size: 18px;
  color: white;
  font-weight: bold;
  padding: 15px 25px;
  justify-content: center;
  display: flex;
  width: 100%;
  border-radius: 25px;
  margin: 50px auto 0 auto;
  cursor: pointer;
`;
