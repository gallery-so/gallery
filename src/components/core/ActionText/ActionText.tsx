import styled from 'styled-components';
import { BaseS } from '../Text/Text';
import colors from '../colors';
import transitions from '../transitions';

type Props = {
  underlined?: boolean;
  focused?: boolean;
  disabled?: boolean;
};

const ActionText = styled(BaseS)<Props>`
  text-transform: uppercase;
  transition: color ${transitions.cubic};

  cursor: pointer;

  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'inherit')};

  color: ${({ focused }) => (focused ? colors.offBlack : colors.shadow)};
  text-decoration: ${({ underlined }) => (underlined ? 'underline' : undefined)};

  &:hover {
    color: ${colors.offBlack};
  }
`;

export default ActionText;
