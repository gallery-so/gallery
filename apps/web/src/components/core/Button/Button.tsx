import Link from 'next/link';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { InternalAnchorElementProps } from '~/types/Elements';

import colors from '~/shared/theme/colors';
import { Spinner } from '../Spinner/Spinner';
import { BODY_FONT_FAMILY } from '../Text/Text';
import transitions from '../transitions';

// A Chrome bug seems to double apply opacity when used with animate, so we add
// an alpha value on hex colors for things like disabled states. This assumes
// that we don't have any sort of dark mode or other theming.

const alphaHex = (percentage: number) => {
  return Math.floor(percentage * 256).toString(16);
};

type StyledButtonProps = {
  variant?: 'primary' | 'secondary' | 'warning';
  disabled?: boolean;
};

const StyledButton = styled.button<StyledButtonProps>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;

  padding: 8px 24px;

  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  text-transform: uppercase;
  text-decoration: none;

  transition: all ${transitions.cubic};

  &:not(:disabled) {
    cursor: pointer;
  }
  &[aria-disabled='true'] {
    pointer-events: none;
  }

  .Button-label {
    opacity: 1;
  }
  &[aria-busy='true'] .Button-label {
    opacity: 0;
  }

  .Button-spinner {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity ${transitions.cubic};
  }

  &[aria-busy='true'] .Button-spinner {
    opacity: 1;
  }

  opacity: ${({ disabled }) => (disabled ? '.5' : '1')};

  ${({ variant = 'primary' }) => {
    if (variant === 'primary') {
      return css`
        background: ${colors.offBlack};
        color: ${colors.white};

        &:hover:not(:disabled) {
          // Assumes hex color, lightened with alpha because opacity + animations break things
          background: ${colors.offBlack} ${alphaHex(0.8)};
        }
        &[aria-disabled='true'] {
          // Assumes hex color, lightened with alpha because opacity + animations break things
          background: ${colors.offBlack} ${alphaHex(0.2)};
        }
      `;
    }

    if (variant === 'secondary') {
      return css`
        background: ${colors.white};
        color: ${colors.offBlack};
        border: 1px solid ${colors.porcelain};
        padding: 7px 23px;

        &:hover:not(:disabled) {
          color: ${colors.offBlack};
          border: 1px solid ${colors.offBlack};
        }
        &[aria-disabled='true'] {
          // Assumes hex color, lightened with alpha because opacity + animations break things
          color: ${colors.shadow} ${alphaHex(0.3)};
          border-color: ${colors.porcelain} ${alphaHex(0.4)};
        }
      `;
    }

    if (variant === 'warning') {
      return css`
        background: transparent;
        border: 1px solid ${colors.porcelain};
        color: ${colors.red};

        &:hover:not(:disabled) {
          border-color: ${colors.red};
        }

        &:hover {
          border-color: ${colors.red};
        }
      `;
    }
  }}
`;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  StyledButtonProps & {
    pending?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = 'button', pending, disabled, children, ...otherProps }: ButtonProps, ref) => (
    <StyledButton
      type={type}
      disabled={disabled || pending}
      aria-disabled={disabled}
      aria-busy={pending}
      {...otherProps}
      ref={ref}
    >
      <span className="Button-label">{children}</span>
      <span className="Button-spinner" aria-hidden>
        <Spinner />
      </span>
    </StyledButton>
  )
);

Button.displayName = 'Button';

type ButtonLinkProps = InternalAnchorElementProps &
  StyledButtonProps & {
    pending?: boolean;
  };

export const ButtonLink = ({
  href,
  pending,
  disabled,
  children,
  ...otherProps
}: ButtonLinkProps) => (
  <Link href={href} passHref legacyBehavior>
    <StyledButton
      as="a"
      tabIndex={disabled ? -1 : undefined}
      aria-disabled={disabled}
      aria-busy={pending}
      {...otherProps}
    >
      <span className="Button-label">{children}</span>
      <span className="Button-spinner" aria-hidden>
        <Spinner />
      </span>
    </StyledButton>
  </Link>
);
