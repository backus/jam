import * as React from "react";
import styled, { keyframes } from "styled-components/macro";

const loadingKeyframes1 = keyframes`{
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}`;

const loadingKeyframes2 = keyframes`{
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}`;
const loadingKeyframes3 = keyframes`{
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}`;

const LoadingAnimRoot = styled.div`
  display: inline-block;
  position: relative;
  width: 80px;
  height: 40px;
  opacity: 0.8;
  padding: 0;

  & div {
    top: 50%;
    position: absolute;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #fff;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  div:nth-child(1) {
    left: 8px;
    animation: ${loadingKeyframes1} 0.6s infinite;
  }
  div:nth-child(2) {
    left: 8px;
    animation: ${loadingKeyframes3} 0.6s infinite;
  }
  div:nth-child(3) {
    left: 32px;
    animation: ${loadingKeyframes3} 0.6s infinite;
  }
  div:nth-child(4) {
    left: 56px;
    animation: ${loadingKeyframes2} 0.6s infinite;
  }
`;

const loadingKeyframes3small = keyframes`{
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(12px, 0);
  }
}`;

const LoadingAnimRootSmall = styled.div`
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
  opacity: 0.8;
  padding: 0;

  & div {
    top: 50%;
    position: absolute;
    width: 6.5px;
    height: 6.5px;
    border-radius: 50%;
    background: #fff;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  div:nth-child(1) {
    left: 4px;
    animation: ${loadingKeyframes1} 0.6s infinite;
  }
  div:nth-child(2) {
    left: 4px;
    animation: ${loadingKeyframes3small} 0.6s infinite;
  }
  div:nth-child(3) {
    left: 16px;
    animation: ${loadingKeyframes3small} 0.6s infinite;
  }
  div:nth-child(4) {
    left: 28px;
    animation: ${loadingKeyframes2} 0.6s infinite;
  }
`;

const LoadingAnimRootDynamic = styled.div<{ height: number }>`
  display: block;
  position: relative;
  width: 40px;
  margin: 0 auto;
  height: ${(props) => props.height}px;
  opacity: 0.8;
  padding: 0;

  & div {
    top: calc(50% - 3.25px);
    position: absolute;
    width: 6.5px;
    height: 6.5px;
    border-radius: 50%;
    background: #fff;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  div:nth-child(1) {
    left: 4px;
    animation: ${loadingKeyframes1} 0.6s infinite;
  }
  div:nth-child(2) {
    left: 4px;
    animation: ${loadingKeyframes3small} 0.6s infinite;
  }
  div:nth-child(3) {
    left: 16px;
    animation: ${loadingKeyframes3small} 0.6s infinite;
  }
  div:nth-child(4) {
    left: 28px;
    animation: ${loadingKeyframes2} 0.6s infinite;
  }
`;

const PageWrap = styled.div`
  width: 80px;
  margin: 0 auto;
  margin-top: 25vh;
`;

export const LoadingPage = () => (
  <PageWrap>
    <LoadingAnim />
  </PageWrap>
);

export const LoadingAnim = () => (
  <LoadingAnimRoot>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </LoadingAnimRoot>
);

export const LoadingAnimSmall = () => (
  <LoadingAnimRootSmall>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </LoadingAnimRootSmall>
);

export const LoadingAnimDynamic: React.FC<{ height: number }> = (props) => (
  <LoadingAnimRootDynamic height={props.height}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </LoadingAnimRootDynamic>
);
