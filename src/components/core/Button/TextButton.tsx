import styled from 'styled-components';
import colors from '../colors';
import ActionText from '../ActionText/ActionText';

type Props = {
  className?: string;
  text: string;
  // TODO: Refactor to support more than MouseEvent
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  changeColorOnHover?: boolean;
  underlineOnHover?: boolean;
  disableTextTransform?: boolean;
  disabled?: boolean;
  dataTestId?: string;
};

function TextButton({
  className,
  text,
  onClick,
  underlineOnHover = false,
  changeColorOnHover = true,
  disableTextTransform = false,
  disabled,
  dataTestId,
}: Props) {
  return (
    <StyledButton
      className={className}
      onClick={onClick}
      underlineOnHover={underlineOnHover}
      changeColorOnHover={changeColorOnHover}
      disabled={disabled}
      data-testid={dataTestId}
    >
      <StyledButtonText disableTextTransform={disableTextTransform} disabled={disabled}>
        {text}
      </StyledButtonText>
    </StyledButton>
  );
}

export const StyledButtonText = styled(ActionText)<Pick<Props, 'disableTextTransform'>>`
  text-transform: ${({ disableTextTransform }) => (disableTextTransform ? 'none' : undefined)};
`;

const StyledButton = styled.button<
  Pick<Props, 'underlineOnHover' | 'disabled' | 'changeColorOnHover'>
>`
  padding: 0;
  border-style: none;
  cursor: pointer;
  background: none;
  width: max-content;

  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'inherit')};

  &:hover ${StyledButtonText} {
    color: ${({ changeColorOnHover }) => (changeColorOnHover ? colors.black : colors.gray50)};
    text-decoration: ${({ underlineOnHover }) => (underlineOnHover ? 'underline' : undefined)};
  }
`;

export default TextButton;
