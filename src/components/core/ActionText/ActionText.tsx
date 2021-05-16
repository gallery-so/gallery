import styled from 'styled-components';
import { BodyRegular } from '../Text/Text';
import colors from '../colors';
import transitions from '../transitions';

type Props = {
  underlined?: boolean;
  focused?: boolean;
};

const ActionText = styled(BodyRegular)<Props>`
  text-transform: uppercase;
  transition: color ${transitions.cubic};

  cursor: pointer;

  color: ${({ focused }) => (focused ? colors.black : colors.gray50)};
  text-decoration: ${({ underlined }) =>
    underlined ? 'underline' : undefined};

  &:hover {
    color: ${colors.black};
  }
`;

export default ActionText;
