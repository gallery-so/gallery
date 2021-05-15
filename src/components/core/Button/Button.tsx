import { memo } from 'react';
import styled from 'styled-components';
import { ButtonText } from '../Text/Text';
import colors from '../colors';

type ButtonStyle = 'primary' | 'secondary';

type Props = {
  type?: ButtonStyle;
  className?: string;
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  dataTestId?: string;
};

function Button({
  type = 'primary',
  className,
  text,
  onClick,
  disabled,
  dataTestId,
}: Props) {
  return (
    <StyledButton
      // renaming this prop `buttonStyle` since the `type` prop
      // already exists for styled components
      buttonStyle={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
    >
      <ButtonText color={type === 'primary' ? colors.white : colors.black}>
        {text}
      </ButtonText>
    </StyledButton>
  );
}

type StyledButtonProps = {
  disabled?: boolean;
  buttonStyle: ButtonStyle;
  children: React.ReactNode;
};

const StyledButton = styled.button<StyledButtonProps>`
  border-style: none;
  border: 1px solid ${colors.black};

  height: 40px;

  background: ${({ buttonStyle }) =>
    buttonStyle === 'primary' ? colors.black : colors.white};

  cursor: pointer;

  text-transform: uppercase;

  transition: opacity 0.2s;
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'inherit')};

  &:hover {
    opacity: 0.8;
  }
`;

export default memo(Button);
