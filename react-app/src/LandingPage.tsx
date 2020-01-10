/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import _ from "lodash";
import styled, { css, keyframes } from "styled-components/macro";
import { LoadedApp } from "./AppContainer";
import { Card, SimpleCard } from "./components/Card";
import { Body } from "./components/SimpleMessageCard";
import api from "./graphqlApi";
import emailIcon from "./img/email-icon.svg";

import { SubmitBtn } from "./components/SubmitBtn";
import { useForm } from "react-hook-form";
import { Emoji } from "./components/Emoji";
import { Link } from "react-router-dom";
import { FlashMessages } from "./Flash";
import { formValidations } from "./utils";
import { Btn } from "./components/Button";
import { WaitlistStatus } from "./api/graphql";
import { Text, Box } from "rebass/styled-components";

interface ILandingPageProps {}

const Logo = styled.span`
  font-style: italic;
  font-weight: 900;
  font-size: 32px;
  line-height: 21px;
  /* identical to box height, or 66% */

  color: #ffffff;

  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.25);
  text-decoration: underline;
  text-decoration-color: #f56ff8;
  text-underline-width: 3px;

  display: inline-block;
  margin-bottom: 20px;
`;

const Wrap = styled.div`
  max-width: 400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SignIn = styled(Link)`
  border-radius: 15px;
  font-weight: bold;
  font-size: 16px;
  height: 20px;
  /* identical to box height */

  display: flex;
  align-items: center;
  text-align: center;

  color: #ffffff;

  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  padding: 8px 20px;
`;

export const LandingPage: React.FC<ILandingPageProps> = (props) => {
  return (
    <Wrap>
      <Header>
        <Logo>Jam!</Logo>
        <SignIn to="/signin">sign in</SignIn>
      </Header>
      <FlashMessages />
      <SimpleCard px="50px" pt="20px" pb="44px">
        <Text
          as="h1"
          fontWeight={900}
          fontSize="24px"
          lineHeight="36px"
          textAlign="left"
        >
          Binge more. Pay less. <Text color="#f56ff8">With friends! 😍</Text>
        </Text>
        <Box fontSize="16px" sx={{ lineHeight: "24px", color: "textPrimary" }}>
          <p>Stop texting your friends for logins.</p>
          <p>
            <strong>Get access to services your friends pay for</strong>,
            instantly and securely.
          </p>
          <p>Don't miss out. Join the beta:</p>
        </Box>
        {/*
          // @ts-expect-error */}
        <Btn as={Link} block variant="pink" fontSize={24} to="/accounts/new">
          Create an account
        </Btn>
      </SimpleCard>
    </Wrap>
  );
};
