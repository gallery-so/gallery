import { AnimatePresence } from 'framer-motion';
import { ReactElement } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { SanityAnnouncementProvider } from '~/contexts/SanityAnnouncementProvider';
import colors from '~/shared/theme/colors';

import AnimatedSidebarDrawer from './AnimatedSidebarDrawer';
import { useDrawerState } from './SidebarDrawerContext';

export const GLOBAL_SIDEBAR_DESKTOP_WIDTH = 64;
export const GLOBAL_SIDEBAR_MOBILE_HEIGHT = 48;

type GlobalSidebarProps = {
  content: ReactElement | null;
};

export default function GlobalSidebar({ content }: GlobalSidebarProps) {
  const drawerState = useDrawerState();

  if (!content) {
    return null;
  }

  const isDrawerOpen = Boolean(drawerState.activeDrawer);

  return (
    <StyledGlobalSidebar isDrawerOpen={isDrawerOpen}>
      <SanityAnnouncementProvider>
        <StyledGlobalSidebarContent>{content}</StyledGlobalSidebarContent>
        <AnimatePresence>
          {drawerState.activeDrawer && (
            <AnimatedSidebarDrawer content={drawerState.activeDrawer.content} />
          )}
        </AnimatePresence>
      </SanityAnnouncementProvider>
    </StyledGlobalSidebar>
  );
}

const StyledGlobalSidebar = styled.div<{ isDrawerOpen: boolean }>`
  position: fixed;
  bottom: 0;
  width: 100vw;
  display: flex;
  flex-direction: column-reverse;

  // this allows the drawer content height to adjust to changing mobile view area height, when the url bar changes height.
  // height should be 100% only when drawer is open because otherwise it will cover the entire screen when drawer is closed
  ${({ isDrawerOpen }) => isDrawerOpen && `height: 100%;`}

  z-index: 2;

  @media only screen and ${breakpoints.tablet} {
    width: initial;
    height: 100vh;
    bottom: initial;
    flex-direction: row;
  }
`;

const StyledGlobalSidebarContent = styled.div`
  display: flex;
  flex-shrink: 0;

  width: 100%;
  background-color: ${colors.offWhite};
  height: ${GLOBAL_SIDEBAR_MOBILE_HEIGHT}px;

  @media only screen and ${breakpoints.tablet} {
    height: 100%;
    width: ${GLOBAL_SIDEBAR_DESKTOP_WIDTH}px;
  }
`;
