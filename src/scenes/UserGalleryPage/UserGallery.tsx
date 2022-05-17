import useKeyDown from 'hooks/useKeyDown';
import NotFound from 'scenes/NotFound/NotFound';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryLayout } from 'scenes/UserGalleryPage/UserGalleryLayout';
import { useModal } from 'contexts/modal/ModalContext';
import NftDetailPage from 'scenes/NftDetailPage/NftDetailPage';
import { UserGalleryFragment$key } from '__generated__/UserGalleryFragment.graphql';

type Props = {
  queryRef: UserGalleryFragment$key;
};

function useDisplayNftDetailModal() {
  const { showModal } = useModal();
  const {
    pathname,
    query: { username, collectionId, nftId, originPage },
    push,
  } = useRouter();

  // TODO: get whether modal is mounted from context, so we don't re-open
  // another modal as the user transitions between NFT detail page
  const returnTo = originPage === 'gallery' ? `/${username}` : `/${username}/${collectionId}`;

  useEffect(() => {
    if (nftId && collectionId) {
      // have to do this weird check on query param types
      if (Array.isArray(collectionId) || Array.isArray(nftId)) {
        return;
      }

      showModal(<NftDetailPage collectionId={collectionId} nftId={nftId} />, () => push(returnTo));
    }
  }, [collectionId, nftId, showModal, push, pathname, returnTo]);
}

function UserGallery({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserGalleryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
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
  const { push } = useRouter();

  const isLoggedIn = Boolean(query.viewer?.user?.id);

  const navigateToEdit = useCallback(() => {
    if (!isLoggedIn) return;
    void push(`/edit`);
  }, [push, isLoggedIn]);

  useKeyDown('e', navigateToEdit);

  useDisplayNftDetailModal();

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return <UserGalleryLayout userRef={user} queryRef={query} />;
}

export default UserGallery;
