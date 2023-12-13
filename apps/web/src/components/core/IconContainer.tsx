import React, { ForwardedRef, forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import colors from '~/shared/theme/colors';

import { NewTooltip } from '../Tooltip/NewTooltip';
import { useTooltipHover } from '../Tooltip/useTooltipHover';

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
    idleForeground: colors.black['800'],

    hoverBackground: colors.porcelain,
    hoverForeground: colors.black['800'],

    activeBackground: 'transparent',
    activeForeground: colors.porcelain,
  },
  default: {
    disabledBackground: colors.faint,
    disabledForeground: colors.metal,

    idleBackground: 'transparent',
    idleForeground: colors.black['800'],

    hoverBackground: colors.faint,
    hoverForeground: colors.black['800'],

    activeBackground: 'transparent',
    activeForeground: colors.porcelain,
  },
  blue: {
    disabledBackground: 'transparent',
    disabledForeground: colors.porcelain,

    idleBackground: 'transparent',
    idleForeground: colors.white,

    hoverBackground: colors.faint,
    hoverForeground: colors.black['800'],

    activeBackground: 'transparent',
    activeForeground: colors.black['800'],
  },
};

type Props = {
  size?: IconSize;
  variant: ColorVariant;
  // TODO: this is a temporary measure. need to refactor with official dark mode support
  mode?: 'light' | 'dark';
  disabled?: boolean;
  className?: string;
  icon: React.ReactElement;
  disableHoverPadding?: boolean;
  tooltipLabel?: string;
  tooltipDescription?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
} & Omit<JSX.IntrinsicElements['div'], 'ref'>;

function IconContainer(
  {
    icon,
    onClick,
    variant,
    // TODO: this is a temporary measure. need to refactor with official dark mode support
    mode = 'light',
    disabled,
    className,
    size = 'md',
    disableHoverPadding = false,
    tooltipLabel,
    tooltipPlacement = 'bottom',
    tooltipDescription,
    ...props
  }: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({ placement: tooltipPlacement });
  return (
    <div ref={ref}>
      <StyledIcon
        {...getReferenceProps()}
        ref={reference}
        onClick={onClick}
        size={size}
        disabled={disabled}
        className={className}
        variant={variant}
        // TODO: this is a temporary measure. need to refactor with official dark mode support
        mode={mode}
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
      {tooltipLabel && (
        <NewTooltip
          {...getFloatingProps()}
          style={floatingStyle}
          ref={floating}
          text={tooltipLabel}
          description={tooltipDescription}
        />
      )}
    </div>
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
  // TODO: this is a temporary measure. need to refactor with official dark mode support
  mode: 'light' | 'dark';
  disableHoverPadding: boolean;
}>`
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  ${({ variant, disabled, mode }) => {
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
              ${mode === 'light'
                ? `
              color: ${variantState.hoverForeground};
              background-color: ${variantState.hoverBackground};

              ${HoverCircle} {
                background-color: ${variantState.hoverBackground};
              }
              `
                : // TODO: this is a temporary measure. need to refactor with official dark mode support
                  `
              color: ${variantState.hoverForeground};
              background-color: ${colors.black['700']};
              ${HoverCircle} {
                background-color: ${colors.black['700']};
              }
              `}
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
