import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserActivityFragment$key } from '~/generated/UserActivityFragment.graphql';
import NotFound from '~/scenes/NotFound/NotFound';

import { UserActivityLayout } from './UserActivityLayout';

type Props = {
  queryRef: UserActivityFragment$key;
};

function UserActivity({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserActivityFragment on Query {
        user: userByUsername(username: $username) @required(action: THROW) {
          ... on GalleryUser {
            __typename

            ...UserActivityLayoutFragment
          }
          ... on ErrUserNotFound {
            __typename
          }
        }

        ...UserActivityLayoutQueryFragment
      }
    `,
    queryRef
  );

  const { user } = query;

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return <UserActivityLayout userRef={user} queryRef={query} />;
}

export default UserActivity;
