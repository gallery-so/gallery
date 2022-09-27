import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Tooltip from 'components/Tooltip/Tooltip';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

type Props = {
  name: string;
  imageURL: string;
};

export default function Badge({ name, imageURL }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setShowTooltip(false);
  }, []);

  // TODO: replace with badge contract address
  const communityUrl = '/community/0x31982936afe7fc432ec1a2766bdba4d07a779b30';

  return (
    <InteractiveLink to={communityUrl}>
      <StyledTooltip text={name} showTooltip={showTooltip} />
      <StyledBadge src={imageURL} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit} />
    </InteractiveLink>
  );
}

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateY(${({ showTooltip }) => (showTooltip ? -28 : 0)}px);
`;

const StyledBadge = styled.img`
  height: 16px;
  width: 16px;
  cursor: pointer;
`;
