import NotFound from 'scenes/NotFound/NotFound';
import UserGalleryCollections from './UserGalleryCollections';
import UserGalleryHeader from './UserGalleryHeader';
import EmptyGallery from './EmptyGallery';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import useMobileLayout from 'hooks/useMobileLayout';
import useKeyDown from 'hooks/useKeyDown';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
        
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

  const ePress = useKeyDown('e');

  const { push } = useRouter();
  const navigateToEdit = function () {
    void push(`/edit`);
  };

  useEffect(() => {
    if (ePress) {
      navigateToEdit();
    }
  }, [ePress]);

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return <UserGalleryLayout userRef={user} queryRef={query} />;
}

export default UserGallery;
