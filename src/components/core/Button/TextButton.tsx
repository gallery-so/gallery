import styled from 'styled-components';
import colors from '../colors';
import ActionText from '../ActionText/ActionText';

type Props = {
  className?: string;
  text: string;
  onClick?: () => void;
};

function TextButton({ className, text, onClick }: Props) {
  return (
    <StyledButton className={className} onClick={onClick}>
      <StyledButtonText>{text}</StyledButtonText>
    </StyledButton>
  );
}

const StyledButtonText = styled(ActionText)``;
const StyledButton = styled.button`
  padding: 6px;
  border-style: none;
  cursor: pointer;
  background: none;

  &:hover ${StyledButtonText} {
    color: ${colors.black};
  }
`;
export default TextButton;
