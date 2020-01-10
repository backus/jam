import React, { FunctionComponent } from "react";
import styled from "styled-components/macro";
import {
  Card as RebassCard,
  CardProps as RebassCardProps,
  Text,
  Flex,
} from "rebass/styled-components";
import * as _ from "lodash";

type TSimpleCardProps = Omit<RebassCardProps, "css">;

export const SimpleCard: React.FC<TSimpleCardProps> = (props) => (
  <RebassCard
    display="flex"
    bg="white"
    width="100%"
    my={0}
    mx="auto"
    color="black"
    {...props}
    sx={{
      flexDirection: "column",
      justifyContent: "center",
      boxShadow: "4px 4px 15px rgba(0, 0, 0, 0.25)",
      borderRadius: "10px",
      position: "relative",
      ...props.sx,
    }}
  />
);

export const InfoCard: React.FC<{
  floatingIcon: JSX.Element;
  title: React.ReactChild;
}> = ({ floatingIcon, title, children }) => {
  return (
    <SimpleCard maxWidth={370}>
      {floatingIcon}
      <Flex pb={20} px={22} flexDirection="column">
        <Text
          textAlign="center"
          as="h3"
          variant="smallHeader"
          fontSize="20px"
          fontWeight="bold"
          pt={33}
          pb={30}
        >
          {title}
        </Text>

        {children}
      </Flex>
    </SimpleCard>
  );
};

const Card = styled.div<{
  verticalPadding?: number;
  wide?: boolean;
  maxWidth?: string;
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  width: 100%;
  max-width: ${(props) => (props.wide ? "400px" : props.maxWidth || "300px")};
  margin: 0 auto;
  background: #ffffff;
  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: ${(props) =>
    `${_.isUndefined(props.verticalPadding) ? 10 : props.verticalPadding}px 0`};
  color: black;
  position: relative;
`;

export const Cards = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  & ${Card} {
    margin-bottom: 40px;
  }
`;

const Title = styled.div`
  font-family: azo-sans-web, sans-serif;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 28px;

  color: #2c3c55;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 0.5px solid #ccc;
  padding-bottom: 20px;
`;

export const Body = styled.div`
  padding: 0 ${(props: { flush?: boolean }) => (props.flush ? "0" : "25px")};
`;

const Label = styled.span`
  z-index: 1;
  background: linear-gradient(109.93deg, #f56ff8 4.83%, #ec6fdf 102.53%);
  box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  font-weight: bold;
  font-size: 16px;
  line-height: 19px;
  height: 19px;
  padding: 8px 20px;
  font-variant: small-caps;
  text-transform: uppercase;
  color: white;
  position: absolute;
  right: 20px;
  top: -17.5px;
  display: inline-block;
`;

const CardComponent: FunctionComponent<{
  title?: string;
  flush?: true;
  className?: string;
  wide?: boolean;
  label?: string;
  verticalPadding?: number;
  maxWidth?: string;
}> = ({
  wide,
  maxWidth,
  title,
  children,
  flush,
  className,
  label,
  verticalPadding,
}) => {
  return (
    <Card
      wide={wide}
      maxWidth={maxWidth}
      className={className}
      verticalPadding={verticalPadding}
    >
      {label && <Label>{label}</Label>}
      {title && (
        <Title>
          <span>{title}</span>
        </Title>
      )}
      <Body flush={flush}>{children}</Body>
    </Card>
  );
};

export const SectionHeader = styled.span`
  font-weight: 900;
  font-size: 18px;
  line-height: 21px;
  /* identical to box height */

  text-transform: uppercase;

  color: #c8c8c8;

  display: block;

  margin: 20px 0 20px 24px;
`;

export { CardComponent as Card };
