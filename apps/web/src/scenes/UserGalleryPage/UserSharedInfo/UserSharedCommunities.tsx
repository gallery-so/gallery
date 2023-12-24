import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { CommunityProfilePictureStack } from '~/components/ProfilePicture/CommunityProfilePictureStack';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserSharedCommunitiesFragment$key } from '~/generated/UserSharedCommunitiesFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { LowercaseChain } from '~/shared/utils/chains';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';
import { getUrlForCommunity } from '~/utils/getCommunityUrlForToken';

import PaginatedCommunitiesList from './UserSharedInfoList/SharedCommunitiesList';

type Props = {
  userRef: UserSharedCommunitiesFragment$key;
};

export const COMMUNITIES_PER_PAGE = 20;
export default function UserSharedCommunities({ userRef }: Props) {
  const user = useFragment(
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
                ...CommunityProfilePictureStackFragment
                ...extractRelevantMetadataFromCommunityFragment
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...SharedCommunitiesListFragment
      }
    `,
    userRef
  );

  const sharedCommunities = useMemo(() => {
    const list = user.sharedCommunities?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [user.sharedCommunities?.edges]);
  const totalSharedCommunities = user.sharedCommunities?.pageInfo?.total ?? 0;

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
      content: <PaginatedCommunitiesList userRef={user} />,
      headerText: 'Pieces you both own',
      isPaddingDisabled: true,
      isFullPage: isMobile,
    });
  }, [isMobile, user, showModal, track]);

  const content = useMemo(() => {
    // Display up to 3 communities
    const result = communitiesToDisplay.map((community) => {
      const { chain, contractAddress } = extractRelevantMetadataFromCommunity(community);
      if (contractAddress && chain) {
        const url = getUrlForCommunity(contractAddress, chain?.toLowerCase() as LowercaseChain);

        if (url) {
          return (
            <StyledGalleryLink
              to={url}
              key={community.name}
              eventElementId="Shared Community Name Link"
              eventName="Shared Community Name Link Click"
              // TODO analytics - this will be variable
              eventContext={contexts.Community}
            >
              {community.name}
            </StyledGalleryLink>
          );
        }
      }
      return <BaseS key={community.name}>{community.name}</BaseS>;
    });

    // If there are more than 3 communities, add a link to show all in a popover
    if (totalSharedCommunities > 3) {
      result.push(
        <StyledGalleryLink
          onClick={handleShowAllClick}
          eventElementId="Shared Communites Remaining Link"
          eventName="Shared Communites Remaining Link Click"
          // TODO analytics - this will be variable
          eventContext={contexts.Community}
        >
          {totalSharedCommunities - 2} others
        </StyledGalleryLink>
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
    <HStack align="center" gap={isMobile ? 4 : 8}>
      <CommunityProfilePictureStack
        communitiesRef={sharedCommunities}
        total={totalSharedCommunities}
        onClick={handleShowAllClick}
      />
      <div>
        <StyledBaseS>Also holds&nbsp;</StyledBaseS>
        {content}
      </div>
    </HStack>
  );
}

const StyledGalleryLink = styled(GalleryLink)`
  font-size: 12px;
`;

const StyledBaseS = styled(BaseS)`
  font-weight: 700;
`;
