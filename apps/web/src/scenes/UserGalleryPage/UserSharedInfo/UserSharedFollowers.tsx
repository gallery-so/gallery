import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { ProfilePictureStack } from '~/components/ProfilePicture/ProfilePictureStack';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserSharedFollowersFragment$key } from '~/generated/UserSharedFollowersFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import PaginatedUsersList from './UserSharedInfoList/SharedFollowersList';

type Props = {
  userRef: UserSharedFollowersFragment$key;
};

export default function UserSharedFollowers({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserSharedFollowersFragment on GalleryUser {
        __typename
        sharedFollowers(first: $sharedFollowersFirst, after: $sharedFollowersAfter)
          @connection(key: "UserSharedInfoFragment_sharedFollowers") {
          edges {
            node {
              __typename
              ... on GalleryUser {
                __typename
                username
                id
                ...ProfilePictureStackFragment
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...SharedFollowersListFragment
      }
    `,
    userRef
  );

  const { showModal } = useModalActions();
  const track = useTrack();
  const isMobile = useIsMobileWindowWidth();

  const handleShowAllFollowersClick = useCallback(() => {
    track('User Gallery - Show All Shared Followers Click');
    showModal({
      content: <PaginatedUsersList userRef={user} />,
      headerText: 'Followers you know',
      isPaddingDisabled: true,
      isFullPage: isMobile,
    });
  }, [isMobile, user, showModal, track]);

  const sharedFollowers = useMemo(() => {
    const list = user.sharedFollowers?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [user.sharedFollowers?.edges]);

  const totalSharedFollowers = user.sharedFollowers?.pageInfo?.total ?? 0;

  // Determine how many users to display by username
  const followersToDisplay = useMemo(() => {
    // In most cases we display a max of 2 usernames. ie "username1, username2 and 3 others you follow"
    // But if there are exactly 3 shared followers, we display all 3 usernames. ie "username1, username2 and username3"
    const maxUsernamesToDisplay = totalSharedFollowers === 3 ? 3 : 2;
    return sharedFollowers.slice(0, maxUsernamesToDisplay);
  }, [sharedFollowers, totalSharedFollowers]);

  const content = useMemo(() => {
    // Display up to 3 usernames
    const result = followersToDisplay.map((user) => (
      <StyledGalleryLink
        to={{
          pathname: `/[username]`,
          query: { username: user.username ?? '' },
        }}
        key={user.id}
        eventElementId="Shared Follower Link"
        eventName="Shared Follower Link Click"
        // TODO analytics - this will be variable
        eventContext={contexts.UserGallery}
      >
        {user.username}
      </StyledGalleryLink>
    ));

    // If there are more than 3 usernames, add a link to show all in a popover
    if (totalSharedFollowers > 3) {
      result.push(
        <StyledGalleryLink
          onClick={handleShowAllFollowersClick}
          eventElementId="Shared Followers Remaining Link"
          eventName="Shared Followers Remaining Link Click"
          // TODO analytics - this will be variable
          eventContext={contexts.UserGallery}
        >
          {totalSharedFollowers - 2} others
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
  }, [followersToDisplay, handleShowAllFollowersClick, totalSharedFollowers]);

  if (totalSharedFollowers === 0) {
    return null;
  }

  return (
    <HStack align="center" gap={isMobile ? 4 : 8}>
      <ProfilePictureStack
        usersRef={sharedFollowers}
        total={totalSharedFollowers}
        onClick={handleShowAllFollowersClick}
      />
      <div>
        <StyledBaseS>Followed by&nbsp;</StyledBaseS>
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
