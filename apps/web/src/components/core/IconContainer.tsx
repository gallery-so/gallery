import React, { ForwardedRef, forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';

import colors from '~/shared/theme/colors';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

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
    disabledBackground: colors.faint,
    disabledForeground: colors.metal,

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
  disableHoverPadding?: boolean;
} & Omit<JSX.IntrinsicElements['div'], 'ref'>;

function IconContainer(
  {
    icon,
    onClick,
    variant,
    disabled,
    className,
    size = 'md',
    disableHoverPadding = false,

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
      disableHoverPadding={disableHoverPadding}
      onMouseDown={(e) => {
        // This will prevent the textarea from losing focus when user clicks a markdown icon
        e.preventDefault();
      }}
      {...props}
    >
      {disableHoverPadding && <HoverCircle variant={variant} size={size} disabled={disabled} />}

      <HStack justify="center" align="center" style={{ position: 'relative', zIndex: 1 }}>
        {icon}
      </HStack>
    </StyledIcon>
  );
}

const HoverCircle = styled.div<{ size: IconSize; variant: ColorVariant; disabled?: boolean }>`
  position: absolute;

  border-radius: 99999999px;

  ${({ size }) => {
    if (size === 'sm') {
      return css`
        height: 24px;
        width: 24px;
      `;
    } else if (size === 'md') {
      return css`
        height: 32px;
        width: 32px;
      `;
    } else if (size === 'lg') {
      return css`
        height: 40px;
        width: 40px;
      `;
    }
  }}
`;

const StyledIcon = styled.div<{
  size: IconSize;
  disabled?: boolean;
  variant: ColorVariant;
  disableHoverPadding: boolean;
}>`
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  ${({ variant, disabled }) => {
    const variantState = COLOR_STATES[variant];

    return css`
      color: ${variantState.idleForeground};
      background-color: ${variantState.idleBackground};

      ${disabled
        ? css`
            color: ${variantState.disabledForeground};
            background-color: ${variantState.disabledBackground};

            ${HoverCircle} {
              background-color: ${variantState.disabledBackground};
            }
          `
        : css`
            :active {
              color: ${variantState.activeForeground};
              background-color: ${variantState.activeBackground};

              ${HoverCircle} {
                background-color: ${variantState.activeBackground};
              }
            }

            :hover {
              color: ${variantState.hoverForeground};
              background-color: ${variantState.hoverBackground};

              ${HoverCircle} {
                background-color: ${variantState.hoverBackground};
              }
            }
          `};
    `;
  }}

  ${({ size, disableHoverPadding }) => {
    if (disableHoverPadding) {
      return null;
    }

    if (size === 'xs') {
      return css`
        height: 20px;
        width: 20px;

        border-radius: 99999999px;
      `;
    } else if (size === 'sm') {
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
