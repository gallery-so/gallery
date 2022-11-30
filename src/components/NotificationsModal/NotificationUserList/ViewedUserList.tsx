import { ViewedUserListFragment$key } from '__generated__/ViewedUserListFragment.graphql';
import { useCallback } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { USERS_PER_PAGE } from '~/components/NotificationsModal/constants';
import { PureUserList } from '~/components/NotificationsModal/NotificationUserList/PureUserList';

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
