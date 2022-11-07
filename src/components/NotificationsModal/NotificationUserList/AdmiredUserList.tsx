import { AdmiredUserListFragment$key } from '__generated__/AdmiredUserListFragment.graphql';
import { useCallback } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { USERS_PER_PAGE } from '~/components/NotificationsModal/constants';
import { PureUserList } from '~/components/NotificationsModal/NotificationUserList/PureUserList';

type AdmiredUserListProps = {
  notificationRef: AdmiredUserListFragment$key;
};

export function AdmiredUserList({ notificationRef }: AdmiredUserListProps) {
  const {
    data: notification,
    hasPrevious,
    isLoadingPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment AdmiredUserListFragment on SomeoneAdmiredYourFeedEventNotification
      @refetchable(queryName: "RefetchableAdmiredUserListFragment") {
        admirers(last: $notificationUsersLast, before: $notificationUsersBefore)
          @connection(key: "AdmiredUserListFragment_admirers") {
          edges {
            __typename
          }

          ...PureUserListFragment
        }
      }
    `,
    notificationRef
  );

  const handleLoadPrevious = useCallback(() => {
    loadPrevious(USERS_PER_PAGE);
  }, [loadPrevious]);

  return (
    <PureUserList
      hasMore={hasPrevious}
      isLoading={isLoadingPrevious}
      loadMore={handleLoadPrevious}
      connectionRef={notification.admirers}
    />
  );
}
