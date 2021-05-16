import { memo } from 'react';
import styled from 'styled-components';
import Loader from '../Loader/Loader';
import { ButtonText } from '../Text/Text';
import colors from '../colors';
import transitions from '../transitions';

type ButtonStyle = 'primary' | 'secondary';

type Props = {
  type?: ButtonStyle;
  className?: string;
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  dataTestId?: string;
};

function Button({
  type = 'primary',
  className,
  text,
  onClick,
  disabled,
  loading,
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
      {loading ? (
        <Loader inverted size="small" />
      ) : (
        <ButtonText color={type === 'primary' ? colors.white : colors.black}>
          {text}
        </ButtonText>
      )}
    </StyledButton>
  );
}

type StyledButtonProps = {
  disabled?: boolean;
  buttonStyle: ButtonStyle;
  children: React.ReactNode;
};

const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;

  border-style: none;
  border: 1px solid ${colors.black};

  height: 40px;

  background: ${({ buttonStyle }) =>
    buttonStyle === 'primary' ? colors.black : colors.white};

  cursor: pointer;

  text-transform: uppercase;

  transition: opacity ${transitions.cubic};
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'inherit')};

  &:hover {
    opacity: 0.8;
  }
`;

export default memo(Button);
