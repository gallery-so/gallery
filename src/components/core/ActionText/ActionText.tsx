import styled from 'styled-components';
import { Text } from '../Text/Text';
import colors from '../colors';

type Props = {
  underlined?: boolean;
  focused?: boolean;
};

const StyledLink = styled(Text)<Props>`
  font-family: 'Helvetica Neue';
  text-transform: uppercase;
  transition: color 0.2s;

  cursor: pointer;

  color: ${({ focused }) => (focused ? colors.black : colors.gray)};
  text-decoration: ${({ underlined }) => (underlined ? 'underline' : '')};

  &:hover {
    color: ${colors.black};
  }
`;

export default StyledLink;
