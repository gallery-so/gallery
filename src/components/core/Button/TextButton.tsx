import styled from 'styled-components';
import colors from '../colors';
import Link from '../Link/Link';

type Props = {
  onClick?: any;
  text: string;
  className?: string;
};

function TextButton(props: Props) {
  return (
    <StyledButton className={props.className} onClick={props.onClick}>
      <StyledButtonText>{props.text}</StyledButtonText>
    </StyledButton>
  );
}

const StyledButtonText = styled(Link)`
  transition: color 0.2s;
`;
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
