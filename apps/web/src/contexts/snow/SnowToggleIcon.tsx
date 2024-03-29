import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import SnowflakeIcon from '~/icons/SnowflakeIcon';

import { useSnowContext } from './SnowContext';

export default function SnowToggleIcon() {
  const { isSnowEnabled, toggleSnow } = useSnowContext();
  return (
    <IconContainer
      size="md"
      variant="default"
      icon={<StyledSnowflakeIcon active={isSnowEnabled} />}
      onClick={toggleSnow}
    />
  );
}

const StyledSnowflakeIcon = styled(SnowflakeIcon)`
  width: 100%;
  padding: 5px;
`;
