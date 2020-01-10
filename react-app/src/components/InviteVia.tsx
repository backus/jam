import React from "react";
import styled from "styled-components/macro";

import smsImg from "./../img/invite-via-sms.svg";
import emailImg from "./../img/invite-via-email.svg";
import linkImg from "./../img/invite-via-link.svg";

import * as _ from "lodash";

const iconMap = {
  email: emailImg,
  sms: smsImg,
  link: linkImg,
};

const InviteViaIcon = styled.div<{ type: "email" | "sms" | "link" }>`
  width: 40px;
  height: 40px;
  border-radius: 50px;
  background: url(${(props) => iconMap[props.type]});
  background-repeat: no-repeat;
  cursor: pointer;
`;

const ViaText = styled.span`
  font-weight: bold;
  font-size: 16px;
  line-height: 40px;

  margin-left: 24px;
  vertical-align: middle;
  display: table-cell;

  color: #555a60;
`;

const ViaWrap = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  padding: 10px 0 10px 25px;
  margin-top: 5px;

  &:hover {
    background-color: #ffd7f7;
    cursor: pointer;
  }
`;

export const InviteVia = (props: {
  type: "email" | "sms" | "link";
  text: string;
  onClick?: () => any;
  "data-jam-analyze"?: string;
}) => {
  const onClick = props.onClick || _.noop;
  return (
    <ViaWrap data-jam-analyze={props["data-jam-analyze"]} onClick={onClick}>
      <InviteViaIcon type={props.type} />
      <ViaText>{props.text}</ViaText>
    </ViaWrap>
  );
};
