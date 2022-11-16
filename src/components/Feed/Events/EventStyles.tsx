import { ReactNode } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { BaseS } from '~/components/core/Text/Text';

import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '../dimensions';

type StyledEventProps = {
  children: ReactNode;
  className?: string;
  onClick?: JSX.IntrinsicElements['div']['onClick'];
};

export const StyledEvent = ({ children, className, onClick }: StyledEventProps) => {
  return (
    <StyledEventWrapper className={className} onClick={onClick}>
      <StyledInnerEvent>{children}</StyledInnerEvent>
    </StyledEventWrapper>
  );
};

export const StyledInnerEvent = styled.div`
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;

// base styles for feed events
export const StyledEventWrapper = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;

  padding: 24px 16px;

  @media only screen and ${breakpoints.tablet} {
    padding: 16px 32px;
  }

  @media only screen and ${breakpoints.desktop} {
    padding: 16px;
  }

  cursor: pointer;
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
  align-self: flex-end;
  display: inline;
  vertical-align: bottom;
`;

export const StyledClickHandler = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
`;
