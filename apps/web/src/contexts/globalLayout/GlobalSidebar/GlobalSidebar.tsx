import { ReactElement, useEffect } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';

import SidebarDrawerProvider from './SidebarDrawerContext';

export const GLOBAL_SIDEBAR_DESKTOP_WIDTH = 64;
export const GLOBAL_SIDEBAR_MOBILE_HEIGHT = 48;

type GlobalSidebarProps = {
  content: ReactElement | null;
  // isVisible: boolean;
};

export default function GlobalSidebar({ content }: GlobalSidebarProps) {
  if (!content) {
    return null;
  }

  return (
    <StyledSidebar>
      <SidebarDrawerProvider>
        <StyledSidebarContent>{content}</StyledSidebarContent>
      </SidebarDrawerProvider>
    </StyledSidebar>
  );
}

const StyledSidebar = styled.div`
  position: fixed;
  bottom: 0;
  height: ${GLOBAL_SIDEBAR_MOBILE_HEIGHT}px;
  width: 100vw;
  display: flex;
  flex-direction: column-reverse;

  z-index: 2;

  @media only screen and ${breakpoints.tablet} {
    width: ${GLOBAL_SIDEBAR_DESKTOP_WIDTH}px;
    height: 100vh;
    bottom: initial;
    flex-direction: row;
  }
`;

const StyledSidebarContent = styled.div`
  display: flex;
  flex-shrink: 0;
  height: 100%;
  width: 100%;
  background-color: ${colors.offWhite};
`;
