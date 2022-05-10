import { useGlobalLayoutState } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect } from 'react';
import styled from 'styled-components';
import CapitalGLoader from './CapitalGLoader';

export default function FullPageLoader() {
  return (
    <StyledFullPageLoader>
      <CapitalGLoader />
    </StyledFullPageLoader>
  );
}

const StyledFullPageLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

/**
 * Same component as above, but with transition support. It handles:
 * 1) communicating when it's mounted vs. not (e.g. when we're hitting Suspense during a transition)
 * 2) appearing *over* or *under* the navbar depending on context
 *
 * This can only be used on components mounted beneath the GlobalLayoutContext.
 */
export function FullPageLoaderWithLayoutTransitionSupport() {
  const { isPageInSuspenseRef, isNavbarVisible, wasNavbarVisible } = useGlobalLayoutState();

  useEffect(() => {
    isPageInSuspenseRef.current = true;
    return () => {
      isPageInSuspenseRef.current = false;
    };
  }, [isPageInSuspenseRef]);

  return (
    <StyledFullPageLoaderWithLayoutTransitionSupport
      /**
       * The navbar should only stay within view if it was visible on the previous page, and is
       * also visible on the next page.
       *
       * Otherwise, we force the FullPageLoader to appear *over* the navbar to avoid seeing it
       * flash in and out.
       */
      keepNavbarInView={isNavbarVisible && wasNavbarVisible}
    >
      <CapitalGLoader />
    </StyledFullPageLoaderWithLayoutTransitionSupport>
  );
}

const StyledFullPageLoaderWithLayoutTransitionSupport = styled.div<{ keepNavbarInView?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 100vh;

  border: 5px solid red;

  ${({ keepNavbarInView }) => {
    return keepNavbarInView
      ? ''
      : `
      position: relative;
      z-index: 4;
      background: white;
    `;
  }}
`;
