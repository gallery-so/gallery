import styled, { css } from 'styled-components';
import colors from '../colors';
import transitions from '../transitions';
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { BODY_FONT_FAMILY } from '../Text/Text';
import Link from 'next/link';
import { Spinner } from '../Spinner/Spinner';

// TODO:
// - why is opacity on disabled+pending so much stronger than just disabled?

type StyledButtonProps = {
  variant?: 'primary' | 'secondary';
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
  &[aria-disabled="true"] {
    pointer-events: none;
  }

  .Button-label {
    opacity: 1;
    transition: all ${transitions.cubic};
  }
  &[aria-busy="true"] .Button-label {
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
  &[aria-busy="true"] .Button-spinner {
    opacity: 1;
  }

  ${({ variant = 'primary' }) => {
    if (variant === 'primary') {
      return css`
        background: ${colors.offBlack};
        color: ${colors.white};
        &:hover:not(:disabled) {
          // Assumes hex color, lightened to 80% opacity with alpha
          // because opacity + animations break things
          background: ${colors.offBlack}${Math.floor(256 * 0.8).toString(16)};
        }

        &[aria-disabled='true'] {
          // Assumes hex color, lightened to 20% opacity with alpha
          // because opacity + animations break things
          background: ${colors.offBlack}${Math.floor(256 * 0.2).toString(16)};
        }
      `;
    }

    if (variant === 'secondary') {
      return css`
        background: ${colors.white};
        color: ${colors.shadow};
        border: 1px solid ${colors.porcelain};
        padding: 7px 23px;

        &:hover:not(:disabled) {
          color: ${colors.offBlack};
          border: 1px solid ${colors.offBlack};
        }

        &[aria-disabled='true'] {
          // Assumes hex color, lightened to 20% opacity with alpha
          // because opacity + animations break things
          background: ${colors.white}${Math.floor(256 * 0.2).toString(16)};
          color: ${colors.shadow}${Math.floor(256 * 0.2).toString(16)};
        }
      `;
    }
  }}}
`;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  StyledButtonProps & {
    pending?: boolean;
  };

export const Button = ({
  type = 'button',
  pending,
  disabled,
  children,
  ...otherProps
}: ButtonProps) => (
  <StyledButton
    type={type}
    disabled={disabled || pending}
    aria-disabled={disabled}
    aria-busy={pending}
    {...otherProps}
  >
    <span className="Button-label">{children}</span>
    <span className="Button-spinner" aria-hidden>
      <Spinner />
    </span>
  </StyledButton>
);

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  StyledButtonProps & {
    pending?: boolean;
    href: string;
  };

export const ButtonLink = ({
  href,
  pending,
  disabled,
  children,
  ...otherProps
}: ButtonLinkProps) => (
  <Link href={href} passHref>
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
