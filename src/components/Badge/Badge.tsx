import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Tooltip from 'components/Tooltip/Tooltip';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo, useState } from 'react';
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
        contract {
          chain
          contractAddress {
            address
          }
        }
      }
    `,
    badgeRef
  );

  const { name, imageURL, contract } = badge;

  const communityUrl = useMemo<Route>(() => {
    const contractAddress = contract?.contractAddress?.address as string;

    if (contract?.chain === 'POAP') {
      return {
        pathname: '/community/poap/[contractAddress]',
        query: { contractAddress },
      };
    } else if (contract?.chain === 'Tezos') {
      return {
        pathname: '/community/tez/[contractAddress]',
        query: { contractAddress },
      };
    } else {
      return {
        pathname: '/community/[contractAddress]',
        query: { contractAddress },
      };
    }
  }, [contract]);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setShowTooltip(false);
  }, []);

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
