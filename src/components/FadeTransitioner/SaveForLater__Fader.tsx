import { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';

const FADE_TRANSITION_MS = 2000;

function WrappedComponent<T extends (props: any) => JSX.Element>({
  Component,
  ...props
}: {
  Component: React.ComponentType | T;
}) {
  // Whether node is actually on the DOM
  const [isMounted, setIsMounted] = useState(false);
  // Pseudo-state for signaling animations. this will allow us
  // to display an animation prior to unmounting
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsActive(true);
    return () => {
      setIsActive(false);
      setTimeout(() => {
        setIsMounted(false);
      }, FADE_TRANSITION_MS);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <_ToggleFade isActive={isActive}>
      <Component {...props} />
    </_ToggleFade>
  );
}

function Fader<T extends (props: any) => JSX.Element, P>(
  Component: React.ComponentType | T,
) {
  return (props: React.Attributes | P) => (
    <WrappedComponent<T> Component={Component} {...props} />
  );
}

const fadeIn = keyframes`
    from { opacity: 0 };
    to { opacity: 1 };
`;

const fadeOut = keyframes`
    from { opacity: 1 };
    to { opacity: 0 };
`;

const transitionStyle = `${FADE_TRANSITION_MS}ms cubic-bezier(0, 0, 0, 1.07)`;

const _ToggleFade = styled.div<{ isActive: boolean }>`
  animation: ${({ isActive }) =>
    css`
      ${isActive ? fadeIn : fadeOut} ${transitionStyle}
    `};
`;

export default Fader;
