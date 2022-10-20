import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

export default function StyledBackLink() {
  const navbarHeight = useGlobalNavbarHeight();

  return <BackLink navbarHeight={navbarHeight} />;
}

// mimics a navbar element on the top left corner
const BackLink = styled.div<{ navbarHeight: number }>`
  height: ${({ navbarHeight }) => navbarHeight}px;
  display: flex;
  align-items: center;

  position: absolute;
  left: 0;
  top: -80px;
  z-index: 3;

  padding: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px;
  }
`;
