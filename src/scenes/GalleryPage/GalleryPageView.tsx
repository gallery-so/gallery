import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalState } from '~/contexts/modal/ModalContext';
import { GalleryPageViewFragment$key } from '~/generated/GalleryPageViewFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import useDisplayFullPageNftDetailModal from '~/scenes/NftDetailPage/useDisplayFullPageNftDetailModal';
import NotFound from '~/scenes/NotFound/NotFound';
import { UserGalleryLayout } from '~/scenes/UserGalleryPage/UserGalleryLayout';

type Props = {
  galleryId: string;
  queryRef: GalleryPageViewFragment$key;
};

function GalleryPageView({ galleryId, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryPageViewFragment on Query {
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
          }
        }

        ...UserGalleryLayoutQueryFragment
      }
    `,
    queryRef
  );

  const { user } = query;
  const { push } = useRouter();

  const loggedInUserId = query.viewer?.user?.dbid;
  const isLoggedIn = Boolean(loggedInUserId);

  const { isModalOpenRef } = useModalState();

  const navigateToEdit = useCallback(() => {
    if (!isLoggedIn) return;
    if (isModalOpenRef.current) return;
    void push({ pathname: '/gallery/[galleryId]/edit', query: { galleryId: galleryId as string } });
  }, [isLoggedIn, isModalOpenRef, push, galleryId]);

  useKeyDown('e', navigateToEdit);

  useDisplayFullPageNftDetailModal();

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return <UserGalleryLayout galleryId={galleryId} userRef={user} queryRef={query} />;
}

export default GalleryPageView;
