import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { SeeMore } from '~/components/Notifications/SeeMore';
import { UserListItem } from '~/components/Notifications/UserListItem';
import { PureUserListFragment$key } from '~/generated/PureUserListFragment.graphql';

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
