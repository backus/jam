import React from "react";
import { Card } from "./../components/Card";
import { Box, Text, Flex } from "rebass/styled-components";
import magicLinkImg from "./../img/magic-link-with-bg.svg";
import { Btn } from "./Button";

export const MagicLinkCard = () => (
  <Card wide verticalPadding={0}>
    <Box
      my="25px"
      pr="75px"
      sx={{
        backgroundImage: `url(${magicLinkImg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center right",
        backgroundSize: "75px",
      }}
    >
      <Text color="textInfo" fontWeight="bold" fontSize="20px">
        Magic Link ✨
      </Text>
      <Text
        variant="detail"
        fontSize="16px"
        mt={11}
        sx={{ lineHeight: "21px" }}
      >
        Share access to your account without revealing your password
      </Text>
    </Box>
  </Card>
);
