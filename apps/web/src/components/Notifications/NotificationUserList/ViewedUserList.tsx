import { useCallback } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { USERS_PER_PAGE } from '~/components/Notifications/constants';
import { PureUserList } from '~/components/Notifications/NotificationUserList/PureUserList';
import { ViewedUserListFragment$key } from '~/generated/ViewedUserListFragment.graphql';

type ViewedUserListProps = {
  notificationRef: ViewedUserListFragment$key;
};

export function ViewedUserList({ notificationRef }: ViewedUserListProps) {
  const {
    data: notification,
    hasPrevious,
    isLoadingPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment ViewedUserListFragment on SomeoneViewedYourGalleryNotification
      @refetchable(queryName: "RefetchableViewedUserListFragment") {
        userViewers(last: $notificationUsersLast, before: $notificationUsersBefore)
          @connection(key: "ViewedUserListFragment_userViewers") {
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
      connectionRef={notification.userViewers}
    />
  );
}
