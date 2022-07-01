import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseS } from 'components/core/Text/Text';
import transitions from 'components/core/transitions';
import styled from 'styled-components';

// base styles for feed events
export const StyledEvent = styled.div`
  padding: 24px 16px;

  @media only screen and ${breakpoints.tablet} {
    padding: 16px;
  }

  transition: background ${transitions.cubic};
  cursor: pointer;
  &:hover {
    background: ${colors.faint};
  }
`;

export const StyledEventHeader = styled.div`
  display: inline;
  width: 100%;

  p {
    display: inline;
    line-height: 16px;
  }

  ${Spacer} {
    display: inline-block;
  }
`;

export const StyledTime = styled(BaseS)`
  color: ${colors.metal};
  align-self: flex-end;
  display: inline;
  vertical-align: bottom;
`;

export const StyledClickHandler = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
`;
