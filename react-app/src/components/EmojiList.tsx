import styled from "styled-components/macro";

export const EmojiList = styled.ul`
  margin: 0 auto;
  font-size: 16px;
  line-height: 30px;
  color: #696d74;

  list-style: none;
  text-indent: none;
  padding-left: 0;

  & > li {
    list-style: none;
    text-indent: none;
    padding-left: 0;

    & > strong {
      font-weight: bold;
    }
  }

  margin-bottom: 21px;
`;
