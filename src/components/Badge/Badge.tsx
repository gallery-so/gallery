import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Tooltip from 'components/Tooltip/Tooltip';
import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { BadgeFragment$key } from '__generated__/BadgeFragment.graphql';

type Props = {
  badgeRef: BadgeFragment$key;
};

export default function Badge({ badgeRef }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const badge = useFragment(
    graphql`
      fragment BadgeFragment on Badge {
        name
        imageURL
      }
    `,
    badgeRef
  );

  const { name, imageURL } = badge;

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
      <StyledTooltip text={name || ''} showTooltip={showTooltip} />
      <StyledBadge src={imageURL} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit} />
    </InteractiveLink>
  );
}

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateY(${({ showTooltip }) => (showTooltip ? -28 : -24)}px);
`;

const StyledBadge = styled.img`
  height: 16px;
  width: 16px;
  cursor: pointer;
`;
