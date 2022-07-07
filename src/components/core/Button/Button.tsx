import styled, { css } from 'styled-components';
import Loader from '../Loader/Loader';
import colors from '../colors';
import transitions from '../transitions';
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { BODY_FONT_FAMILY } from '../Text/Text';
import Link from 'next/link';

// TODO:
// - should a `loading` button be disabled/non-interactive?
// - should `Loader` be conditionally inverted based on `variant`?
// - should `Loader` just always be `mini`?
// - why is opacity on disabled+loading so much stronger than just disabled?
// - does ButtonLink need to handle absolute URLs separately? or does Link do that?
//   - should ButtonLink also add rel="noopener,noreferer" to target="_blank" links?

type StyledButtonProps = {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;
  cursor: pointer;

  padding: 6px 24px;
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
        padding: 5px 23px;
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
  mini,
  loading,
  dataTestId,
  children,
  type = 'button',
  ...otherProps
}: ButtonProps) => (
  <StyledButton type={type} data-testid={dataTestId} {...otherProps}>
    {loading ? <Loader inverted size={mini ? 'mini' : 'small'} /> : children}
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
  mini,
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
      {loading ? <Loader inverted size={mini ? 'mini' : 'small'} /> : children}
    </StyledButton>
  </Link>
);
