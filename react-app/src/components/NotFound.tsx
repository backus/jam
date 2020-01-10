import React from "react";
import { Text, Box } from "rebass/styled-components";
import { SimpleCard } from "./Card";
import { Btn } from "./Button";
import { Emoji } from "./Emoji";
import { Link } from "react-router-dom";

export const NotFound = () => (
  <SimpleCard>
    <Text
      textAlign="center"
      as="h3"
      variant="smallHeader"
      fontSize="28px"
      fontWeight="bold"
      pt={33}
      pb={30}
    >
      <Text as="span" pr="10px">
        🤷‍♂️
      </Text>
      Not found
    </Text>
    <Box maxWidth={300} mx="auto">
      <Text variant="info" as="p">
        Whoops, we're not able to find the page you were looking for.
      </Text>
      <Text variant="info" as="p" pt={24}>
        Either we have a bug or you mistyped something in the URL.
      </Text>
      {/*
          // @ts-expect-error */}
      <Btn as={Link} to="/" variant="blue" block fontSize="20px" my="30px">
        <Emoji>🏠</Emoji> Go home
      </Btn>
    </Box>
  </SimpleCard>
);
