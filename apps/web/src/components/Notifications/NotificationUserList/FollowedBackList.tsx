import { useCallback } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { USERS_PER_PAGE } from '~/components/Notifications/constants';
import { PureUserList } from '~/components/Notifications/NotificationUserList/PureUserList';
import { FollowedBackListFragment$key } from '~/generated/FollowedBackListFragment.graphql';

type FollowedBackListProps = {
  notificationRef: FollowedBackListFragment$key;
};

export function FollowedBackList({ notificationRef }: FollowedBackListProps) {
  const {
    data: notification,
    loadPrevious,
    isLoadingPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment FollowedBackListFragment on SomeoneFollowedYouBackNotification
      @refetchable(queryName: "RefetchableFollowedBackListFragment") {
        followers(last: $notificationUsersLast, before: $notificationUsersBefore)
          @connection(key: "FollowedBackListFragment_followers") {
          # Relay doesn't allow @connection w/o edges so we must query for it
          # eslint-disable-next-line relay/unused-fields
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
