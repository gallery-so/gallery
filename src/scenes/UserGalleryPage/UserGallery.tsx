import useKeyDown from 'hooks/useKeyDown';
import NotFound from 'scenes/NotFound/NotFound';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryLayout } from 'scenes/UserGalleryPage/UserGalleryLayout';
import { UserGalleryFragment$key } from '__generated__/UserGalleryFragment.graphql';
import useDisplayFullPageNftDetailModal from 'scenes/NftDetailPage/useDisplayFullPageNftDetailModal';
import { useModalState } from 'contexts/modal/ModalContext';
import useIs3ac from 'hooks/oneOffs/useIs3ac';

type Props = {
  queryRef: UserGalleryFragment$key;
};

function UserGallery({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserGalleryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }

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
  const { push, query: routerQuery } = useRouter();

  const loggedInUserId = query.viewer?.user?.dbid;
  const isLoggedIn = Boolean(loggedInUserId);

  const { isModalOpenRef } = useModalState();

  const navigateToEdit = useCallback(() => {
    if (!isLoggedIn) return;
    if (isModalOpenRef.current) return;
    void push(`/edit`);
  }, [push, isLoggedIn, isModalOpenRef]);

  useKeyDown('e', navigateToEdit);

  useDisplayFullPageNftDetailModal();

  const is3acLoggedIn = useIs3ac(loggedInUserId) && isLoggedIn;

  // hide profile for users who aren't logged in
  if (
    !is3acLoggedIn &&
    typeof routerQuery?.username === 'string' &&
    routerQuery?.username?.toLowerCase() === '3ac'
  ) {
    return <NotFound />;
  }

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return <UserGalleryLayout userRef={user} queryRef={query} />;
}

export default UserGallery;
