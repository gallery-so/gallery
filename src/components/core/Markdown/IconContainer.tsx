import React, { ForwardedRef, forwardRef } from 'react';
import styled, { css } from 'styled-components';

import colors from '../colors';

export type IconSize = 'sm' | 'md' | 'lg';

export type ColorVariant = 'blue' | 'default' | 'stacked';

type ColorState = {
  disabledBackground: string;
  disabledForeground: string;

  idleBackground: string;
  idleForeground: string;

  hoverBackground: string;
  hoverForeground: string;

  activeBackground: string;
  activeForeground: string;
};

type ColorStates = { [key in ColorVariant]: ColorState };

const COLOR_STATES: ColorStates = {
  stacked: {
    disabledBackground: 'transparent',
    disabledForeground: colors.porcelain,

    idleBackground: 'transparent',
    idleForeground: colors.offBlack,

    hoverBackground: colors.porcelain,
    hoverForeground: colors.offBlack,

    activeBackground: 'transparent',
    activeForeground: colors.porcelain,
  },
  default: {
    disabledBackground: 'transparent',
    disabledForeground: colors.porcelain,

    idleBackground: 'transparent',
    idleForeground: colors.offBlack,

    hoverBackground: colors.faint,
    hoverForeground: colors.offBlack,

    activeBackground: 'transparent',
    activeForeground: colors.porcelain,
  },
  blue: {
    disabledBackground: 'transparent',
    disabledForeground: colors.porcelain,

    idleBackground: 'transparent',
    idleForeground: colors.white,

    hoverBackground: colors.faint,
    hoverForeground: colors.offBlack,

    activeBackground: 'transparent',
    activeForeground: colors.offBlack,
  },
};

type Props = {
  size?: IconSize;
  variant: ColorVariant;
  disabled?: boolean;
  className?: string;
  icon: React.ReactElement;
} & Omit<JSX.IntrinsicElements['div'], 'ref'>;

function IconContainer(
  {
    icon,
    onClick,
    variant,
    disabled,
    className,
    size = 'md',

    ...props
  }: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <StyledIcon
      ref={ref}
      onClick={onClick}
      size={size}
      disabled={disabled}
      className={className}
      variant={variant}
      onMouseDown={(e) => {
        // This will prevent the textarea from losing focus when user clicks a markdown icon
        e.preventDefault();
      }}
      {...props}
    >
      {icon}
    </StyledIcon>
  );
}

const StyledIcon = styled.div<{
  size: IconSize;
  disabled?: boolean;
  variant: ColorVariant;
}>`
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  ${({ variant }) => {
    const variantState = COLOR_STATES[variant];

    return css`
      color: ${variantState.idleForeground};
      background-color: ${variantState.idleBackground};

      :active {
        color: ${variantState.activeForeground};
        background-color: ${variantState.activeBackground};
      }

      :hover {
        color: ${variantState.hoverForeground};
        background-color: ${variantState.hoverBackground};
      }

      :disabled {
        color: ${variantState.disabledForeground};
        background-color: ${variantState.disabledBackground};
      }
    `;
  }}

  ${({ size }) => {
    if (size === 'sm') {
      return css`
        height: 24px;
        width: 24px;

        border-radius: 99999999px;
      `;
    } else if (size === 'md') {
      return css`
        height: 32px;
        width: 32px;

        border-radius: 99999999px;
      `;
    } else if (size === 'lg') {
      return css`
        height: 40px;
        width: 40px;

        border-radius: 99999999px;
      `;
    }
  }}
`;

const ForwardedIconContainer = forwardRef<HTMLDivElement, Props>(IconContainer);

export default ForwardedIconContainer;
