import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserSharedCommunitiesFragment$key } from '~/generated/UserSharedCommunitiesFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { getUrlForCommunity } from '~/utils/getCommunityUrlForToken';

import PaginatedCommunitiesList from '../Modals/PaginatedList/PaginatedCommunitiesList';

type Props = {
  queryRef: UserSharedCommunitiesFragment$key;
};

export const COMMUNITIES_PER_PAGE = 20;
export default function UserSharedCommunities({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserSharedCommunitiesFragment on GalleryUser {
        __typename
        sharedCommunities(first: $sharedCommunitiesFirst, after: $sharedCommunitiesAfter)
          @connection(key: "UserSharedCommunitiesFragment_sharedCommunities") {
          edges {
            node {
              __typename
              ... on Community {
                __typename
                name
                chain
                contractAddress {
                  address
                }
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...PaginatedCommunitiesListFragment
      }
    `,
    queryRef
  );

  const sharedCommunities = useMemo(
    () => query.sharedCommunities?.edges?.map((edge) => edge?.node) ?? [],
    [query.sharedCommunities?.edges]
  );
  const totalSharedCommunities = query.sharedCommunities?.pageInfo?.total ?? 0;

  // Determine how many users to display by username
  const communitiesToDisplay = useMemo(() => {
    // In most cases we display a max of 2 communities. ie "community1, community2 and 3 others"
    // But if there are exactly 3 shared communities, we display all 3. ie "community1, community2 and community3"
    const maxNamesToDisplay = totalSharedCommunities === 3 ? 3 : 2;
    return sharedCommunities.slice(0, maxNamesToDisplay);
  }, [sharedCommunities, totalSharedCommunities]);

  const { showModal } = useModalActions();
  const track = useTrack();
  const isMobile = useIsMobileWindowWidth();

  const handleShowAllClick = useCallback(() => {
    track('User Gallery - Show All Shared Communities Click');
    showModal({
      content: <PaginatedCommunitiesList queryRef={query} />,
      headerText: 'Pieces you both own',
      isPaddingDisabled: true,
      isFullPage: isMobile,
    });
  }, [isMobile, query, showModal, track]);

  const content = useMemo(() => {
    // Display up to 3 communities
    const result = communitiesToDisplay.map((community) => {
      if (!community) return null;
      if (community.contractAddress?.address && community.chain) {
        const url = getUrlForCommunity(community.contractAddress?.address, community.chain);

        if (url) {
          return (
            <StyledInteractiveLink to={url} key={community.name}>
              {community.name}
            </StyledInteractiveLink>
          );
        }
      }
      return <BaseS key={community.name}>{community.name}</BaseS>;
    });

    // If there are more than 3 communities, add a link to show all in a popover
    if (totalSharedCommunities > 3) {
      result.push(
        <StyledInteractiveLink onClick={handleShowAllClick}>
          {totalSharedCommunities - 2} others you own
        </StyledInteractiveLink>
      );
    }

    // Add punctuation: "," and "and"
    if (result.length === 3) {
      result.splice(1, 0, <StyledBaseS>,&nbsp;</StyledBaseS>);
    }
    if (result.length > 1) {
      result.splice(-1, 0, <StyledBaseS>&nbsp;and&nbsp;</StyledBaseS>);
    }

    return result;
  }, [communitiesToDisplay, handleShowAllClick, totalSharedCommunities]);

  if (totalSharedCommunities === 0) {
    return null;
  }

  return (
    <HStack align="center" wrap="wrap">
      <StyledBaseS>Also holds&nbsp;</StyledBaseS>
      {content}
    </HStack>
  );
}

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 12px;
  white-space: nowrap;
`;

const StyledBaseS = styled(BaseS)`
  font-weight: 700;
`;
