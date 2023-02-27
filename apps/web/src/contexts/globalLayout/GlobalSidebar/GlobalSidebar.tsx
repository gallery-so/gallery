import { ReactElement, useEffect } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';

import SidebarDrawerProvider from './SidebarDrawerContext';

export const GLOBAL_SIDEBAR_WIDTH = 64;

type GlobalSidebarProps = {
  content: ReactElement | null;
  // isVisible: boolean;
};

export default function GlobalSidebar({ content }: GlobalSidebarProps) {
  // useEffect(() => {
  //   console.log({ isVisible });
  // }, [isVisible]);
  // useEffect(() => {
  //   if (!isVisible) {
  //     if (
  //       // for touch-enabled devices, we need to keep the upper area of the screen clickable;
  //       // without this, users wouldn't be able to click near the top of the device
  //       isTouchscreen.current ||
  //       // if the route doesn't want the navbar to be in view, we need to remove it completely
  //       // so that the user can click on elements where the navbar would be
  //       fadeType === 'route'
  //     ) {
  //       // this is normally as simple as setting the navbar z-index to -1, but doing so right
  //       // away makes it look like the navbar vanishes immediately; therefore we add a delay
  //       // until the navbar has already faded out of sight.
  //       const timeoutId = setTimeout(() => setZIndex(-1), FADE_TRANSITION_TIME_MS);

  //       return () => clearTimeout(timeoutId);
  //     }
  //   }
  //   setZIndex(2);
  // }, [isVisible, fadeType]);
  if (!content) {
    return null;
  }

  return (
    <StyledSidebar>
      <StyledSidebarContent>
        <SidebarDrawerProvider>{content}</SidebarDrawerProvider>
      </StyledSidebarContent>
    </StyledSidebar>
  );
}

const StyledSidebar = styled.div`
  position: fixed;
  bottom: 0;
  height: 48px;
  width: 100vw;

  z-index: 2;

  @media only screen and ${breakpoints.tablet} {
    width: ${GLOBAL_SIDEBAR_WIDTH}px;
    height: 100vh;
    bottom: initial;
  }
`;

const StyledSidebarContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background-color: ${colors.offWhite};
  flex-direction: column-reverse;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
  }
`;
