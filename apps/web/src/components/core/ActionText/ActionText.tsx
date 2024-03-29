import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import { BaseS } from '../Text/Text';
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

  color: ${({ focused }) => (focused ? colors.black['800'] : colors.shadow)};
  text-decoration: ${({ underlined }) => (underlined ? 'underline' : undefined)};

  &:hover {
    color: ${colors.black['800']};
  }
`;

export default ActionText;
