import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';

export const StandardNavbarContainer = styled.div`
  width: 100%;
  height: 56px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px;
    height: 64px;
  }
`;

export const NavbarLeftContent = styled.div`
  display: flex;
  justify-content: flex-start;

  flex: 1 0 0px;
`;

export const NavbarCenterContent = styled.div`
  display: flex;
  justify-content: center;

  flex: 1 1 content;
`;

export const NavbarRightContent = styled.div`
  display: flex;
  justify-content: flex-end;

  flex: 1 0 0px;
`;
