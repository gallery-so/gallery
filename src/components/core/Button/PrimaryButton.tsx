import { memo } from 'react';
import styled from 'styled-components';
import { Text } from '../Text/Text';
import colors from '../colors';

type Props = {
  className?: string;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
};

function PrimaryButton({ className, text, onClick, disabled }: Props) {
  return (
    <StyledPrimaryButton
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      <Text color={colors.white}>{text}</Text>
    </StyledPrimaryButton>
  );
}

type StyledPrimaryButtonProps = {
  disabled?: boolean;
};

const StyledPrimaryButton = styled.button<StyledPrimaryButtonProps>`
  border-style: none;
  padding: 12px 16px;

  background: black;
  color: white;

  cursor: pointer;

  text-transform: uppercase;

  transition: opacity 0.2s;
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'inherit')};

  &:hover {
    opacity: 0.8;
  }
`;

export default memo(PrimaryButton);
