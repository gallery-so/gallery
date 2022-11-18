import { ReactNode } from 'react';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';

type StyledEventProps = {
  children: ReactNode;
  className?: string;
  onClick?: JSX.IntrinsicElements['div']['onClick'];
};

export const StyledEvent = ({ children, className, onClick }: StyledEventProps) => {
  return (
    <StyledInnerEvent onClick={onClick} className={className}>
      {children}
    </StyledInnerEvent>
  );
};

export const StyledInnerEvent = styled.div`
  flex-grow: 1;
`;

export const StyledEventHeader = styled.div`
  display: inline;
  width: 100%;

  p {
    display: inline;
    line-height: 16px;
  }
`;

export const StyledTime = styled(BaseS)`
  color: ${colors.metal};
  align-self: center;
  display: inline;
`;

export const StyledClickHandler = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
`;

export const StyledEventContent = styled(VStack)<{ hasCaption?: boolean }>`
  background-color: ${({ hasCaption }) => (hasCaption ? colors.offWhite : 'transparent')};
  padding: ${({ hasCaption }) => (hasCaption ? '16px' : '0')};
`;
