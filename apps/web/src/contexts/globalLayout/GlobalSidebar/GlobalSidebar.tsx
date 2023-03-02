import { AnimatePresence } from 'framer-motion';
import { ReactElement } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';

import AnimatedSidebarDrawer from './AnimatedSidebarDrawer';
import { useDrawerState } from './SidebarDrawerContext';

export const GLOBAL_SIDEBAR_DESKTOP_WIDTH = 64;
export const GLOBAL_SIDEBAR_MOBILE_HEIGHT = 48;

type GlobalSidebarProps = {
  content: ReactElement | null;
};

const ShowDoneFooter = ['settings'];

export default function GlobalSidebar({ content }: GlobalSidebarProps) {
  const drawerState = useDrawerState();

  if (!content) {
    return null;
  }

  return (
    <StyledSidebar>
      <StyledSidebarContent>{content}</StyledSidebarContent>
      <AnimatePresence>
        {drawerState.activeDrawer && (
          <AnimatedSidebarDrawer
            content={drawerState.activeDrawer.content}
            headerText={drawerState.activeDrawer.headerText}
            showDoneFooter={ShowDoneFooter.includes(drawerState.activeDrawer.drawerName)}
          />
        )}
      </AnimatePresence>
    </StyledSidebar>
  );
}

const StyledSidebar = styled.div`
  position: fixed;
  bottom: 0;
  height: 100%;
  max-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column-reverse;

  z-index: 2;

  @media only screen and ${breakpoints.tablet} {
    width: initial;
    height: 100vh;
    bottom: initial;
    flex-direction: row;
  }
`;

const StyledSidebarContent = styled.div`
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
