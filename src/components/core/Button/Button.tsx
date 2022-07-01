import { memo, useMemo } from 'react';
import styled from 'styled-components';
import Loader from '../Loader/Loader';
import { TitleXS } from '../Text/Text';
import colors from '../colors';
import transitions from '../transitions';

type ButtonStyle = 'primary' | 'secondary';

type Props = {
  type?: ButtonStyle;
  className?: string;
  text?: string;
  mini?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  dataTestId?: string;
};

function Button({
  type = 'primary',
  className,
  text,
  mini = false,
  onClick,
  disabled,
  loading,
  dataTestId,
}: Props) {
  const ButtonComponent = useMemo(
    () => (type === 'primary' ? StyledPrimaryButton : StyledSecondaryButton),
    [type]
  );

  return (
    <ButtonComponent
      // Renaming this prop `buttonStyle` since the `type` prop
      // already exists for styled components
      buttonStyle={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      mini={mini}
    >
      {loading ? (
        <Loader inverted size={mini ? 'mini' : 'small'} />
      ) : (
        <TitleXS color={type === 'primary' ? colors.white : colors.shadow}>{text}</TitleXS>
      )}
    </ButtonComponent>
  );
}

type StyledButtonProps = {
  disabled?: boolean;
  buttonStyle: ButtonStyle;
  mini?: boolean;
};

const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  justify-content: center;
  align-items: center;

  border-style: none;

  height: 32px;

  cursor: pointer;

  text-transform: uppercase;
  padding: 0 24px;

  transition: border ${transitions.cubic}, opacity ${transitions.cubic};
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'inherit')};
`;

const StyledPrimaryButton = styled(StyledButton)`
  background: ${colors.offBlack};

  &:hover {
    background: ${colors.offBlack};
    opacity: 0.8;
  }
`;

const StyledSecondaryButton = styled(StyledButton)`
  border: 1px solid ${colors.porcelain};
  background: ${colors.white};
  // secondary button has 1px less padding to account for border
  padding: 0 23px;

  ${TitleXS} {
    transition: color ${transitions.cubic};
  }

  &:hover {
    ${TitleXS} {
      color: ${colors.offBlack};
    }
    border: 1px solid ${colors.offBlack};
  }
`;

export default memo(Button);
