import styled, { css } from 'styled-components';
import colors from '../colors';
import transitions from '../transitions';
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { BODY_FONT_FAMILY } from '../Text/Text';
import Link from 'next/link';
import { Spinner } from '../Spinner/Spinner';

// TODO:
// - should a `loading` button be disabled/non-interactive?
// - why is opacity on disabled+loading so much stronger than just disabled?
// - does ButtonLink need to handle absolute URLs separately? or does Link do that?
//   - should ButtonLink also add rel="noopener,noreferer" to target="_blank" links?

type StyledButtonProps = {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
};

const StyledButton = styled.button<StyledButtonProps>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;
  cursor: pointer;

  padding: 8px 24px;

  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  text-transform: uppercase;
  text-decoration: none;

  transition: all ${transitions.cubic};

  &:disabled,
  &[aria-disabled="true"] {
    opacity: 0.2;
    pointer-events: none;
  }

  .Button-label {
    opacity: 1;
    transition: all ${transitions.cubic};
  }
  &.Button--loading .Button-label {
    opacity: 0;
  }

  .Button-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: all ${transitions.cubic};
  }
  &.Button--loading .Button-spinner {
    opacity: 1;
  }


  ${({ variant = 'primary' }) => {
    if (variant === 'primary') {
      return css`
        background: ${colors.offBlack};
        color: ${colors.white};
        &:hover {
          background: ${colors.offBlack};
          opacity: 0.8;
        }
      `;
    }

    if (variant === 'secondary') {
      return css`
        background: ${colors.white};
        color: ${colors.shadow};
        border: 1px solid ${colors.porcelain};
        padding: 7px 23px;
        &:hover {
          color: ${colors.offBlack};
          border: 1px solid ${colors.offBlack};
        }
      `;
    }
  }}}
`;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  StyledButtonProps & {
    mini?: boolean;
    loading?: boolean;
    dataTestId?: string;
  };

export const Button = ({
  loading,
  dataTestId,
  children,
  type = 'button',
  ...otherProps
}: ButtonProps) => (
  <StyledButton
    type={type}
    data-testid={dataTestId}
    className={loading ? 'Button--loading' : undefined}
    {...otherProps}
  >
    <span className="Button-label">{children}</span>
    <span className="Button-spinner" aria-hidden={!loading}>
      <Spinner />
    </span>
  </StyledButton>
);

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  StyledButtonProps & {
    mini?: boolean;
    loading?: boolean;
    dataTestId?: string;
    href: string;
  };

export const ButtonLink = ({
  loading,
  dataTestId,
  children,
  href,
  disabled,
  ...otherProps
}: ButtonLinkProps) => (
  <Link href={href} passHref>
    <StyledButton
      as="a"
      tabIndex={disabled ? -1 : undefined}
      aria-disabled={disabled}
      data-testid={dataTestId}
      {...otherProps}
    >
      {loading ? <Spinner /> : children}
    </StyledButton>
  </Link>
);
