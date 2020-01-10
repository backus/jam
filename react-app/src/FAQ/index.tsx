/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import styled, { css, keyframes } from "styled-components/macro";
import { LoadedApp } from "./../AppContainer";
import { Card } from "./../components/Card";
import faqRaw from "./faq.json";
// eslint-disable-next-line

const faq = faqRaw.map((item) => ({
  ...item,
  id: item.q
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, "-"),
}));

const Body = styled.div`
  --color: #555a60;
  color: var(--color);

  & > h1 {
    font-weight: 900;
    font-size: 36px;
    text-align: center;
  }

  & > h2 {
    font-weight: bold;
    font-size: 30px;
  }

  & > p {
    line-height: 1.53;
  }

  & > ul {
    list-style-position: inside;
    padding-left: 0;
    line-height: 1.5;
  }

  & a {
    color: var(--color);
    font-weight: 500;
  }
`;

export const FAQ: React.FC = (props) => {
  return (
    <Card maxWidth="768px">
      <Body>
        <h1>FAQ</h1>
        <p>
          You’ve got questions, we’ve got answers. Click any of the questions
          below to jump to the answer:
        </p>
        <ul>
          {faq.map(({ q, id }, index) => (
            <li key={index}>
              <a href={`#${id}`}>{q}</a>
            </li>
          ))}
        </ul>
        {faq.map(({ q, a, id }, index) => (
          <React.Fragment key={index}>
            <h2 id={id}>{q}</h2>
            {a.map((part, i) => (
              <p key={i}>{part}</p>
            ))}
          </React.Fragment>
        ))}
      </Body>
    </Card>
  );
};
