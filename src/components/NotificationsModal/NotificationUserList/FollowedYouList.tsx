import { FollowedYouListFragment$key } from '__generated__/FollowedYouListFragment.graphql';
import { useCallback } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { USERS_PER_PAGE } from '~/components/NotificationsModal/constants';
import { PureUserList } from '~/components/NotificationsModal/NotificationUserList/PureUserList';

type FollowedYouListProps = {
  notificationRef: FollowedYouListFragment$key;
};

export function FollowedYouList({ notificationRef }: FollowedYouListProps) {
  const {
    data: notification,
    isLoadingPrevious,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment FollowedYouListFragment on SomeoneFollowedYouNotification
      @refetchable(queryName: "RefetchableFollowedYouListFragment") {
        followers(last: $notificationUsersLast, before: $notificationUsersBefore)
          @connection(key: "FollowedYouListFragment_followers") {
          edges {
            __typename
          }

          ...PureUserListFragment
        }
      }
    `,
    notificationRef
  );

  const handleLoadMore = useCallback(() => {
    loadPrevious(USERS_PER_PAGE);
  }, [loadPrevious]);

  return (
    <PureUserList
      loadMore={handleLoadMore}
      isLoading={isLoadingPrevious}
      hasMore={hasPrevious}
      connectionRef={notification.followers}
    />
  );
}
