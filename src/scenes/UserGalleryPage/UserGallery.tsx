import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalState } from '~/contexts/modal/ModalContext';
import { UserGalleryFragment$key } from '~/generated/UserGalleryFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import useDisplayFullPageNftDetailModal from '~/scenes/NftDetailPage/useDisplayFullPageNftDetailModal';
import NotFound from '~/scenes/NotFound/NotFound';
import { UserGalleryLayout } from '~/scenes/UserGalleryPage/UserGalleryLayout';

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
              featuredGallery {
                dbid
              }
            }
            viewerGalleries {
              gallery {
                dbid
              }
            }
          }
        }

        user: userByUsername(username: $username) @required(action: THROW) {
          ... on GalleryUser {
            __typename

            featuredGallery {
              dbid
            }

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

  // If the user has a featured gallery, use that. Otherwise, use the first gallery in the list.
  const galleryId =
    query.viewer?.user?.featuredGallery?.dbid || query.viewer?.viewerGalleries?.[0]?.gallery?.dbid;

  if (!galleryId) {
    throw new Error('No galleryId found');
  }

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

export default UserGallery;
