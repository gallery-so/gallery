import colors from 'components/core/colors';
import { BaseS } from 'components/core/Text/Text';
import transitions from 'components/core/transitions';
import styled from 'styled-components';

// base styles for feed events
export const StyledEvent = styled.div`
  padding: 16px;
  transition: background ${transitions.cubic};
  cursor: pointer;
  &:hover {
    background: ${colors.faint};
  }
`;

export const StyledEventHeader = styled.div`
  display: flex;
  width: 100%;
`;

export const StyledTime = styled(BaseS)`
  color: ${colors.metal};
  align-self: flex-end;
`;

export const StyledClickHandler = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
`;
