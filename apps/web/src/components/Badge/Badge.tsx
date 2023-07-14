import { Route } from 'nextjs-routes';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import Tooltip from '~/components/Tooltip/Tooltip';
import { BADGE_ENABLED_COMMUNITY_ADDRESSES } from '~/constants/community';
import { BadgeFragment$key } from '~/generated/BadgeFragment.graphql';
import { Chain } from '~/generated/enums';

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

    /* The returned chain is usually uppercase, so we have to make sure we always convert
     them to lowercase, otherwise user's will see the inconsistent routes.

     TODO: we could probablly think of a better way to handle this, so we don't have to do this manually everytime.
    */
    const chain = contract?.chain?.toLocaleLowerCase() as Chain;

    return {
      pathname: `/community/[chain]/[contractAddress]`,
      query: { contractAddress, chain },
    };
  }, [contract]);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const isEnabled = useMemo(() => {
    return BADGE_ENABLED_COMMUNITY_ADDRESSES.has(contract?.contractAddress?.address ?? '');
  }, [contract?.contractAddress?.address]);

  if (!isEnabled) {
    return null;
  }

  return (
    <StyledInteractiveLink to={communityUrl}>
      <StyledTooltip text={name || ''} showTooltip={showTooltip} />
      <IconContainer
        size="md"
        variant="default"
        icon={
          <StyledBadge
            src={imageURL}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseExit}
          />
        }
      />
    </StyledInteractiveLink>
  );
}

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateY(${({ showTooltip }) => (showTooltip ? -28 : -24)}px);
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  position: relative;
  line-height: 1;
  outline: none;
`;

const StyledBadge = styled.img`
  width: 100%;
  max-width: 24px;
  max-height: 24px;
  cursor: pointer;
`;
