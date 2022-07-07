import styled, { css } from 'styled-components';
import Loader from '../Loader/Loader';
import colors from '../colors';
import transitions from '../transitions';
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { BODY_FONT_FAMILY } from '../Text/Text';

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
  // TODO: figure out if loading should disable the button
  <StyledButton type={type} data-testid={dataTestId} {...otherProps}>
    {/* TODO: figure out if Loader inverted should be conditional based on variant */}
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
  // TODO: figure out if loading should disable the button
  <StyledButton
    as="a"
    href={href}
    tabIndex={disabled ? -1 : 0}
    aria-disabled={disabled}
    data-testid={dataTestId}
    {...otherProps}
  >
    {/* TODO: figure out if Loader inverted should be conditional based on variant */}
    {loading ? <Loader inverted size={mini ? 'mini' : 'small'} /> : children}
  </StyledButton>
);
