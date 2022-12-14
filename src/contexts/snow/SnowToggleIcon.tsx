import styled from 'styled-components';

import IconContainer from '~/components/core/Markdown/IconContainer';
import SnowflakeIcon from '~/icons/SnowflakeIcon';

import { useSnowContext } from './SnowContext';

export default function SnowToggleIcon() {
  const { isSnowEnabled, toggleSnow } = useSnowContext();
  return (
    <IconContainer
      size="sm"
      icon={<StyledSnowflakeIcon active={isSnowEnabled} />}
      onClick={toggleSnow}
    />
  );
}

const StyledSnowflakeIcon = styled(SnowflakeIcon)`
  padding: 3px;
`;
