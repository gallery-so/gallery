import styled from 'styled-components';
import colors from '../colors';
import ActionText from '../ActionText/ActionText';

type Props = {
  className?: string;
  text: string;
  onClick?: () => void;
  underlineOnHover?: boolean;
  disableTextTransform?: boolean;
  disabled?: boolean;
};

function TextButton({
  className,
  text,
  onClick,
  underlineOnHover = false,
  disableTextTransform = false,
  disabled,
}: Props) {
  return (
    <StyledButton
      className={className}
      onClick={onClick}
      underlineOnHover={underlineOnHover}
      disabled={disabled}
    >
      <StyledButtonText
        disableTextTransform={disableTextTransform}
        disabled={disabled}
      >
        {text}
      </StyledButtonText>
    </StyledButton>
  );
}

const StyledButtonText = styled(ActionText)<
Pick<Props, 'disableTextTransform'>
>`
  text-transform: ${({ disableTextTransform }) =>
    disableTextTransform ? 'none' : undefined};
`;

const StyledButton = styled.button<Pick<Props, 'underlineOnHover' | 'disabled'>>`
  padding: 0;
  border-style: none;
  cursor: pointer;
  background: none;
  width: max-content;

  pointer-events: ${({ disabled }) => disabled ? 'none' : 'inherit'};

  &:hover ${StyledButtonText} {
    color: ${colors.black};
    text-decoration: ${({ underlineOnHover }) =>
    underlineOnHover ? 'underline' : undefined};
  }
`;

export default TextButton;
