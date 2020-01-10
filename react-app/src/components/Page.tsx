import * as React from "react";
import {
  withRouter,
  RouteComponentProps,
  Link,
  useHistory,
} from "react-router-dom";
import backButton from "./../img/back-button.svg";
import homeIcon from "./../img/home-icon.svg";
import styled from "styled-components/macro";
import { useAppHistory } from "../AppHistory";
import { Image } from "rebass/styled-components";

const maxWidth = "400px";

const FullPageWrap = styled.div<{ maxWidth?: string }>`
  max-width: ${(props) => props.maxWidth || maxWidth};
  @media screen and (max-width: 375px) {
    max-width: calc(100vw - 30px);
  }
  margin: 0 auto;
  display: flex;
  padding-top: 10px;
  min-height: calc(100vh - 10px);
  flex-direction: column;
`;

const Content = styled.div<{ maxWidth?: string }>`
  max-width: ${(props) => props.maxWidth || maxWidth};
  flex: 1 0 auto;
`;

const BackButton: React.FC<{ kind: "home" | "back"; onClick: () => any }> = ({
  kind,
  onClick,
}) => {
  return (
    <Image
      src={kind === "back" ? backButton : homeIcon}
      width="25px"
      sx={{ cursor: "pointer" }}
      onClick={onClick}
    />
  );
};

const Header = styled.div<{ maxWidth?: string }>`
  max-width: ${(props) => props.maxWidth || maxWidth};
  position: relative;
  padding-bottom: 30px;
`;

const HeaderSpacing = styled.div`
  height: 25px;
`;

const Title = styled.h2`
  font-weight: bold;
  font-size: 36px;
  line-height: 42px;

  color: #ffffff;
`;

const Footer = styled.footer`
  height: 20px;
  padding: 30px 0 40px 0;
  font-size: 16px;
  color: white;
  flex-shrink: 0;

  a {
    color: white;
    border-bottom: 1px solid white;
    text-decoration: none;
  }

  & > ul {
    text-align: center;
    margin: 0;
    padding-left: 0;

    & > li {
      display: inline;
      white-space: pre-wrap;

      &:after {
        content: "  |  ";
      }

      &:last-child:after {
        content: none;
      }
    }
  }
`;

interface PageProps extends RouteComponentProps {
  title?: string;
  maxWidth?: string;
}

const PageComponent: React.SFC<PageProps> = (props) => {
  const { canGoBack } = useAppHistory();

  return (
    <FullPageWrap maxWidth={props.maxWidth}>
      <Content maxWidth={props.maxWidth}>
        {props.history.location.pathname === "/" ? (
          <HeaderSpacing />
        ) : (
          <Header maxWidth={props.maxWidth}>
            {canGoBack() ? (
              <BackButton kind="back" onClick={() => props.history.goBack()} />
            ) : (
              <BackButton kind="home" onClick={() => props.history.push("/")} />
            )}
            {props.title && <Title>{props.title}</Title>}
          </Header>
        )}
        <>{props.children}</>
      </Content>
      <Footer>
        <ul>
          <li>
            <Link to="/terms">Terms</Link>
          </li>
          <li>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/faq">FAQ</Link>
          </li>
        </ul>
      </Footer>
    </FullPageWrap>
  );
};

const Page = withRouter(PageComponent);

export { Page };
