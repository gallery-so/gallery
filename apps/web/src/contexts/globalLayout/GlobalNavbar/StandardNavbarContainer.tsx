import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';

import { GLOBAL_SIDEBAR_DESKTOP_WIDTH } from '../GlobalSidebar/GlobalSidebar';

export const StandardNavbarContainer = styled.div`
  width: 100%;
  height: 56px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: 0 24px;

  padding: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    margin-left: ${GLOBAL_SIDEBAR_DESKTOP_WIDTH}px;
  }
`;

export const NavbarLeftContent = styled.div`
  display: flex;
  justify-content: flex-start;

  min-width: 0;
  flex: 1 1 20%;
`;

export const NavbarCenterContent = styled.div`
  display: flex;
  justify-content: center;
  min-width: 0;

  flex: 1 1 content;
`;

export const NavbarRightContent = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 3px;

  min-width: 0;
  flex: 1 1 20%;
`;
