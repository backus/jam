import React from "react";
import styled, { css, keyframes } from "styled-components/macro";
import magnifyingGlass from "./../img/magnifyingGlass.svg";

const SearchInput = styled.input.attrs({ type: "text" })`
  height: 50px;
  width: 100%;
  background: url(${magnifyingGlass}), rgba(185, 180, 184, 0.35);
  background-repeat: no-repeat;
  background-position: 10px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-sizing: border-box;
  border-radius: 10px;

  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 50px;
  /* identical to box height */

  text-indent: 35px;

  color: #b3b6bb;

  &::placeholder {
    color: #b3b6bb;
  }

  outline: none;

  caret-color: #555a60;
`;

export const SearchBar: React.FC<any> = (props) => (
  <SearchInput
    data-jam-analyze="find-friends/search"
    placeholder="Search by username"
    {...props}
  />
);
