import { PureUserListFragment$key } from '__generated__/PureUserListFragment.graphql';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { SeeMore } from '~/components/NotificationsModal/SeeMore';
import { UserListItem } from '~/components/NotificationsModal/UserListItem';

type PureUserListProps = {
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  connectionRef: PureUserListFragment$key | null;
};

export function PureUserList({ connectionRef, isLoading, hasMore, loadMore }: PureUserListProps) {
  const connection = useFragment(
    graphql`
      fragment PureUserListFragment on GroupNotificationUsersConnection {
        edges {
          node {
            dbid
            ...UserListItemFragment
          }
        }
      }
    `,
    connectionRef
  );

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of connection?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [connection?.edges]);

  return (
    <>
      {nonNullUsers.map((user) => {
        return <UserListItem key={user.dbid} userRef={user} />;
      })}
      {hasMore && <SeeMore onClick={loadMore} isLoading={isLoading} />}
    </>
  );
}
