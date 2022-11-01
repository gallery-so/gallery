import styled from 'styled-components';
import { pageGutter } from 'components/core/breakpoints';

export const StandardNavbarContainer = styled.div`
  width: 100%;
  height: 56px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: 0 24px;

  padding: 0 ${pageGutter.mobile}px;
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

  min-width: 0;
  flex: 1 1 20%;
`;
