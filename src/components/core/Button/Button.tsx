import styled, { css } from 'styled-components';
import Loader from '../Loader/Loader';
import colors from '../colors';
import transitions from '../transitions';
import { ButtonHTMLAttributes } from 'react';
import { BODY_FONT_FAMILY } from '../Text/Text';

type StyledButtonProps = {
  variant?: 'primary' | 'secondary';
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  StyledButtonProps & {
    mini?: boolean;
    loading?: boolean;
    dataTestId?: string;
  };

export function Button({
  mini,
  loading,
  dataTestId,
  children,
  type = 'button',
  ...otherProps
}: ButtonProps) {
  return (
    // TODO: figure out if loading should disable the button
    <StyledButton type={type} data-testid={dataTestId} {...otherProps}>
      {/* TODO: figure out if Loader inverted should be conditional based on variant */}
      {loading ? <Loader inverted size={mini ? 'mini' : 'small'} /> : children}
    </StyledButton>
  );
}

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

  transition: all ${transitions.cubic};

  &:disabled {
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
