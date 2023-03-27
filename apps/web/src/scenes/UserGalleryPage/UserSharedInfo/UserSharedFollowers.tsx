import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { BaseS } from '~/components/core/Text/Text';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserSharedFollowersFragment$key } from '~/generated/UserSharedFollowersFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import PaginatedUsersList from './UserSharedInfoList/SharedFollowersList';

type Props = {
  queryRef: UserSharedFollowersFragment$key;
};

export default function UserSharedFollowers({ queryRef }: Props) {
  const query = useFragment(
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
    queryRef
  );

  const { showModal } = useModalActions();
  const track = useTrack();
  const isMobile = useIsMobileWindowWidth();

  const handleShowAllFollowersClick = useCallback(() => {
    track('User Gallery - Show All Shared Followers Click');
    showModal({
      content: <PaginatedUsersList queryRef={query} />,
      headerText: 'Followers you know',
      isPaddingDisabled: true,
      isFullPage: isMobile,
    });
  }, [isMobile, query, showModal, track]);

  const sharedFollowers = useMemo(() => {
    const list = query.sharedFollowers?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [query.sharedFollowers?.edges]);

  const totalSharedFollowers = query.sharedFollowers?.pageInfo?.total ?? 0;

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
      <StyledInteractiveLink
        to={{
          pathname: `/[username]`,
          query: { username: user.username ?? '' },
        }}
        key={user.username}
      >
        {user.username}
      </StyledInteractiveLink>
    ));

    // If there are more than 3 usernames, add a link to show all in a popover
    if (totalSharedFollowers > 3) {
      result.push(
        <StyledInteractiveLink onClick={handleShowAllFollowersClick}>
          {totalSharedFollowers - 2} others you follow
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
  }, [followersToDisplay, handleShowAllFollowersClick, totalSharedFollowers]);

  if (totalSharedFollowers === 0) {
    return null;
  }

  return (
    <div>
      <StyledBaseS>Followed by&nbsp;</StyledBaseS>
      {content}
    </div>
  );
}

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 12px;
`;

const StyledBaseS = styled(BaseS)`
  font-weight: 700;
`;
