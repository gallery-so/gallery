import { memo } from 'react';
import styled from 'styled-components';
import { Text } from '../Text/Text';
import colors from '../colors';

type Props = {
  className?: string;
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  dataTestId?: string;
  thicc?: boolean;
};

function PrimaryButton({
  className,
  text,
  onClick,
  disabled,
  dataTestId,
  thicc = true,
}: Props) {
  return (
    <StyledPrimaryButton
      className={className}
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      thicc={thicc}
    >
      <Text color={colors.white}>{text}</Text>
    </StyledPrimaryButton>
  );
}

type StyledPrimaryButtonProps = {
  disabled?: boolean;
  thicc: boolean;
};

const StyledPrimaryButton = styled.button<StyledPrimaryButtonProps>`
  border-style: none;
  padding: ${({ thicc }) => (thicc ? '12px 16px' : 0)};

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
