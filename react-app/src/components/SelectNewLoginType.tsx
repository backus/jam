import React, { useState } from "react";
import { SimpleCard } from "./Card";
import { Text, Box, Card, Flex, Image, Link } from "rebass/styled-components";
import magicLinkHatWithBg from "./../img/magic-link-with-bg.svg";
import secureCredentialsIcon from "./../img/secure-credentials-icon-with-bg.svg";
import { Link as ReactLink } from "react-router-dom";
import theme from "../theme";

const LoginTypeCard: React.FC<{
  to: string;
  title: string;
  desc: string;
  image: string;
}> = (props) => {
  return (
    <Card
      width="100%"
      px={15}
      py={20}
      my="25px"
      sx={{
        transition: "all 0.35s ease",
        border: "0.75px solid #ddd",
        boxShadow: "1px 1px 1px rgba(0, 0, 0, 0.1)",
        borderRadius: "5px",
        ":hover": {
          cursor: "pointer",
          background: "#F0F6FA",
          borderColor: "#56AFEF",
          boxShadow: "1px 1px 1px rgba(86, 175, 239, 0.1)",
        },
      }}
    >
      <Box
        minHeight="85px"
        pl="93px"
        sx={{
          background: `url(${props.image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "75px",
          backgroundPosition: "center left",
        }}
      >
        <Text fontSize={20} fontWeight="bold" color="textPrimary">
          {props.title}
        </Text>
        <Text fontSize={14} color="textDetail" mt="10px" lineHeight={1.53}>
          {props.desc}
        </Text>
      </Box>
    </Card>
  );
};

export const SelectNewLoginType: React.FC = (props) => {
  return (
    <SimpleCard px={22} py={30}>
      <Text
        as="h2"
        fontSize={20}
        color="textPrimary"
        fontWeight="medium"
        textAlign="center"
      >
        What type of login do you want to create?
      </Text>

      <Link
        as={ReactLink}
        // @ts-expect-error
        to="/logins/credentials/new"
        sx={{ textDecoration: "none" }}
      >
        <LoginTypeCard
          to="/logins/credentials/new"
          title="Secure credentials"
          desc="Save your username and password on Jam."
          image={secureCredentialsIcon}
        />
      </Link>

      <Text
        display="flex"
        textAlign="center"
        color="textDetail"
        sx={{
          alignItems: "center",
          "&::before, &::after": {
            content: "''",
            flex: 1,
            borderBottom: `0.5px solid ${theme.colors.textDetail}`,
            marginLeft: "15px",
            marginRight: "15px",
          },
        }}
      >
        or
      </Text>

      <Link
        as={ReactLink}
        // @ts-expect-error
        to="/logins/magic_link/new"
        sx={{ textDecoration: "none" }}
      >
        <LoginTypeCard
          to="/logins/magic_link/new"
          title="Magic link"
          desc="Use Jam’s browser extension to share accounts with friends, without sharing your password."
          image={magicLinkHatWithBg}
        />
      </Link>
    </SimpleCard>
  );
};
