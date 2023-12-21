import { forwardRef, MouseEvent } from 'react';
import styled, { css } from 'styled-components';

import colors from '~/shared/theme/colors';

type Props = {
  active?: boolean;
  width?: number;
  height?: number;
  onClick?: (e: MouseEvent) => void;
};

export const CommentIcon = forwardRef<HTMLDivElement, Props>(
  ({ onClick, active, width = 24, height = 24 }, ref) => {
    return (
      <IconWrapper
        active={active ?? false}
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        ref={ref}
      >
        <StyledSvg
          viewBox="0 0 24 24"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
        >
          <path d="M3 17V4H21V17H12L7 21V17H3Z" />
        </StyledSvg>
      </IconWrapper>
    );
  }
);

CommentIcon.displayName = 'CommentIcon';

export const AdmireIcon = forwardRef<HTMLDivElement, Props>(
  ({ onClick, active, width = 24, height = 24 }, ref) => {
    return (
      <IconWrapper
        active={active ?? false}
        ref={ref}
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
      >
        <StyledSvg
          width={width}
          height={height}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          fill={active ? 'currentColor' : 'none'}
        >
          <path d="M15.5355 6.53553C16.3546 5.71645 16.8602 4.64245 16.975 3.5H17.025C17.1398 4.64245 17.6454 5.71645 18.4645 6.53553C19.2835 7.35462 20.3576 7.86017 21.5 7.97495V8.02505C20.3576 8.13983 19.2835 8.64538 18.4645 9.46447C17.6454 10.2835 17.1398 11.3576 17.025 12.5H16.975C16.8602 11.3576 16.3546 10.2835 15.5355 9.46447C14.7165 8.64538 13.6424 8.13983 12.5 8.02505V7.97495C13.6424 7.86017 14.7165 7.35462 15.5355 6.53553Z" />
          <path d="M5.82843 15.8284C6.45974 15.1971 6.85823 14.3765 6.96864 13.5H7.03136C7.14177 14.3765 7.54026 15.1971 8.17157 15.8284C8.80289 16.4597 9.6235 16.8582 10.5 16.9686V17.0314C9.6235 17.1418 8.80289 17.5403 8.17157 18.1716C7.54026 18.8029 7.14177 19.6235 7.03136 20.5H6.96864C6.85823 19.6235 6.45974 18.8029 5.82843 18.1716C5.19711 17.5403 4.3765 17.1418 3.5 17.0314V16.9686C4.3765 16.8582 5.19711 16.4597 5.82843 15.8284Z" />
          <path d="M6 4V9" />
          <path d="M3.5 6.5H8.5" />
          <path d="M18 16V21" />
          <path d="M15.5 18.5H20.5" />
        </StyledSvg>
      </IconWrapper>
    );
  }
);

AdmireIcon.displayName = 'AdmireIcon';

const StyledSvg = styled.svg<{ height: number; width: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;

  pointer-events: none;

  transition: transform 150ms ease-in-out, color 150ms ease-in-out;
`;

export const IconWrapper = styled.div<{ active: boolean }>`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 9999999px;

  &:hover {
    background: ${colors.faint};
  }

  :active ${StyledSvg} {
    // Spec says 21.6 px which is 24 * .9
    transform: scale(0.9);
    color: ${colors.activeBlue};
  }

  ${({ active }) =>
    active
      ? css`
          color: ${colors.activeBlue};
        `
      : css`
          color: ${colors.black['800']};
        `}
`;
