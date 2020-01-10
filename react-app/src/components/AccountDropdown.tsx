import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components/macro";
import { Link as RouterLink } from "react-router-dom";
import env from "./../clientEnv";
import clientEnv from "./../clientEnv";
import { Avatar } from "../Avatar";

const DropdownCaret = styled.span<{ size: number }>`
  vertical-align: middle;
  margin-left: 8px;

  border-top-style: solid;
  border-top-width: ${(props) => props.size}px;
  border-right: ${(props) => props.size}px solid transparent;
  border-bottom: 0 solid transparent;
  border-left: ${(props) => props.size}px solid transparent;
`;

const AvatarDropdownToggle = styled.div`
  display: inline-flex;
  align-items: center;

  cursor: pointer;
  transition: all 0.1s ease-in;
  color: white;

  &:hover {
    color: #edeaff;
  }
`;

const DropdownMenu = styled.ul`
  z-index: 1;
  padding: 5px 0;
  margin: 0;
  background: white;
  position: absolute;
  width: 120px;
  right: 0;
  top: calc(100% + 8px);
  font-size: 14px;

  list-style: none;
  border-radius: 3px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.25);

  &::before {
    top: -12px;
    right: 7.75px;
    left: auto;
    border: 6px solid transparent;
    border-bottom-color: white;
    /* background-color: red; */
    position: absolute;
    display: inline-block;
    content: "";
  }
`;

const Link = styled(RouterLink)``;

const DropdownMenuItem = styled.li`
  font-size: 12px;
  color: #555a60;
  text-align: left;
  padding-left: 10px;
  height: 28px;
  vertical-align: middle;
  line-height: 28px;
  background: white;
  cursor: pointer;

  &:hover,
  &:hover > ${Link} {
    background: #e36fd8;
    color: white;
    font-weight: 500;
  }

  & > ${Link} {
    text-decoration: none;
    color: #555a60;
  }

  outline: none;
`;

const AccountDropdownWrapper = styled.div`
  display: inline;
  position: relative;
  user-select: none;
`;

export const AccountDropdown: React.FC<{
  avatarUrl: string;
  onSignOut: () => Promise<any>;
}> = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const handleClick = (event: MouseEvent) => {
    if (!ref.current!.contains(event.target as Node)) setDropdownOpen(false);
  };

  // Clicking outside of component should close the dropdown
  useEffect(() => {
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <AccountDropdownWrapper ref={ref}>
      <AvatarDropdownToggle onClick={() => setDropdownOpen(!dropdownOpen)}>
        <Avatar
          circle
          size="32px"
          uri={props.avatarUrl}
          sx={{
            border: "1px solid #FFECB3",
          }}
        />
        <DropdownCaret size={6.4} />
      </AvatarDropdownToggle>
      {dropdownOpen && (
        <DropdownMenu>
          <DropdownMenuItem>
            <Link to="/me">Update my profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={props.onSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenu>
      )}
    </AccountDropdownWrapper>
  );
};
