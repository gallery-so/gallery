import { ReactNode } from 'react';
import styled, { css } from 'styled-components';

import colors from '~/shared/theme/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS, TitleDiatypeM } from '~/components/core/Text/Text';

type StyledEventProps = {
  children: ReactNode;
  className?: string;
  isSubEvent?: boolean;
  onClick?: JSX.IntrinsicElements['div']['onClick'];
};

export const StyledEvent = ({ children, className, isSubEvent, onClick }: StyledEventProps) => {
  return (
    <StyledInnerEvent onClick={onClick} className={className} isSubEvent={isSubEvent}>
      {children}
    </StyledInnerEvent>
  );
};

export const StyledInnerEvent = styled.div<{ isSubEvent?: boolean }>`
  flex-grow: 1;

  ${({ isSubEvent }) =>
    isSubEvent &&
    css`
      padding: 12px;
      border: 1px solid ${colors.faint};

      &:first-child {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }

      &:last-child {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      &:not(:last-child) {
        border-bottom: none;
      }

      &:hover {
        background-color: ${colors.offWhite};
      }
    `}
`;

export const StyledEventHeader = styled.div`
  display: inline;
  width: 100%;

  p {
    display: inline-block;
    line-height: 16px;
  }
`;

export const StyledTime = styled(BaseS)`
  color: ${colors.metal};
  align-self: center;
  display: inline;
  padding-left: 4px;
`;

export const StyledClickHandler = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
`;

export const StyledEventContent = styled(VStack)<{ hasCaption?: boolean; isSubEvent?: boolean }>`
  padding: ${({ hasCaption, isSubEvent }) => {
    if (isSubEvent) {
      return '16px 0';
    } else if (hasCaption) {
      return '16px';
    } else {
      return '0';
    }
  }};

  ${({ hasCaption }) =>
    hasCaption &&
    css`
      border: 1px solid ${colors.faint};
      border-radius: 4px;

      &:hover {
        background-color: ${colors.offWhite};
      }
    `}

  ${({ isSubEvent }) =>
    isSubEvent &&
    css`
      border: none;
    `}
`;

export const StyledEventLabel = styled(TitleDiatypeM)`
  display: inline-block;
`;

export const StyledEventText = styled(BaseM)<{ isSubEvent?: boolean }>`
  display: contents;

  ${({ isSubEvent }) =>
    isSubEvent &&
    css`
      &:first-letter {
        text-transform: capitalize;
      }
    `}
`;
