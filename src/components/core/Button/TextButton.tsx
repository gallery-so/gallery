import styled from 'styled-components';
import colors from '../colors';
import ActionText from '../ActionText/ActionText';

type Props = {
  className?: string;
  text: string;
  onClick?: () => void;
  underlineOnHover?: boolean;
};

function TextButton({
  className,
  text,
  onClick,
  underlineOnHover = false,
}: Props) {
  return (
    <StyledButton
      className={className}
      onClick={onClick}
      underlineOnHover={underlineOnHover}
    >
      <StyledButtonText>{text}</StyledButtonText>
    </StyledButton>
  );
}

const StyledButtonText = styled(ActionText)``;

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
