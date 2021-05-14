import styled from 'styled-components';
import colors from '../colors';
import ActionText from '../ActionText/ActionText';

type Props = {
  className?: string;
  text: string;
  onClick?: () => void;
  underlineOnHover?: boolean;
  disableTextTransform?: boolean;
};

function TextButton({
  className,
  text,
  onClick,
  underlineOnHover = false,
  disableTextTransform = false,
}: Props) {
  return (
    <StyledButton
      className={className}
      onClick={onClick}
      underlineOnHover={underlineOnHover}
    >
      <StyledButtonText disableTextTransform={disableTextTransform}>
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

const StyledButton = styled.button<Pick<Props, 'underlineOnHover'>>`
  padding: 0;
  border-style: none;
  cursor: pointer;
  background: none;

  &:hover ${StyledButtonText} {
    color: ${colors.black};
    text-decoration: ${({ underlineOnHover }) =>
      underlineOnHover ? 'underline' : undefined};
  }
`;

export default TextButton;
