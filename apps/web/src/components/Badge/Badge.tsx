import { Route } from 'nextjs-routes';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import IconContainer from '~/components/core/IconContainer';
import Tooltip from '~/components/Tooltip/Tooltip';
import { BadgeFragment$key } from '~/generated/BadgeFragment.graphql';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { LowercaseChain } from '~/shared/utils/chains';
import { BADGE_ENABLED_COMMUNITY_ADDRESSES } from '~/shared/utils/communities';

import { VStack } from '../core/Spacer/Stack';
import { TopMemberBadge } from '../Notifications/notifications/YouReceivedTopActivityBadge';

type Props = {
  badgeRef: BadgeFragment$key;
  eventContext: GalleryElementTrackingProps['eventContext'];
};

export default function Badge({ badgeRef, eventContext }: Props) {
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

  const communityUrl = useMemo<Route | null>(() => {
    if (!contract) {
      return null;
    }

    const contractAddress = contract?.contractAddress?.address as string;

    const chain = contract?.chain?.toLocaleLowerCase() as LowercaseChain;

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
    if (contract) {
      return BADGE_ENABLED_COMMUNITY_ADDRESSES.has(contract?.contractAddress?.address ?? '');
    }
    return Boolean(imageURL);
  }, [contract, imageURL]);

  if (!isEnabled) {
    return null;
  }

  if (badge.name === 'Top Member') {
    return (
      <>
        <StyledTooltip text={name || ''} showTooltip={showTooltip} />
        <VStack
          align="center"
          justify="center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseExit}
        >
          <TopMemberBadge />
        </VStack>
      </>
    );
  }

  const BadgeImage = () => (
    <>
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
    </>
  );

  if (!communityUrl) {
    return <BadgeImage />;
  }

  return (
    <StyledGalleryLink
      eventElementId="Badge"
      eventName="Badge Click"
      eventContext={eventContext}
      to={communityUrl}
    >
      <BadgeImage />
    </StyledGalleryLink>
  );
}

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateY(${({ showTooltip }) => (showTooltip ? 28 : 24)}px);
  z-index: 5;
`;

const StyledGalleryLink = styled(GalleryLink)`
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
