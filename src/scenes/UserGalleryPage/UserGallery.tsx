import NotFound from 'scenes/NotFound/NotFound';
import useKeyDown from 'hooks/useKeyDown';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryFragment$key } from '__generated__/UserGalleryFragment.graphql';
import { UserGalleryLayout } from 'scenes/UserGalleryPage/UserGalleryLayout';

type Props = {
  queryRef: UserGalleryFragment$key;
};

function UserGallery({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserGalleryFragment on Query {
        user: userByUsername(username: $username) @required(action: THROW) {
          ... on GalleryUser {
            __typename

            ...UserGalleryLayoutFragment
          }
          ... on ErrUserNotFound {
            __typename
            message
          }
        }

        ...UserGalleryLayoutQueryFragment
      }
    `,
    queryRef
  );

  const { user } = query;

  const { push } = useRouter();
  const navigateToEdit = useCallback(() => {
    void push(`/edit`);
  }, [push]);

  useKeyDown('e', navigateToEdit);

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return <UserGalleryLayout userRef={user} queryRef={query} />;
}

export default UserGallery;
