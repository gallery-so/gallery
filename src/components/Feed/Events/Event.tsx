import colors from 'components/core/colors';
import { BaseS } from 'components/core/Text/Text';
import styled from 'styled-components';

// base styles for feed events
export const StyledEvent = styled.div`
  margin: 16px;
`;

export const StyledEventHeader = styled.div`
  display: flex;
  width: 100%;
`;

export const StyledTime = styled(BaseS)`
  color: ${colors.metal};
  align-self: flex-end;
`;
