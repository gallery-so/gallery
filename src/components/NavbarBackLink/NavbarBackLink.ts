import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';

// mimics a navbar element on the top left corner
const StyledBackLink = styled.div`
  height: 80px;
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

export default StyledBackLink;
