import useKeyDown from 'hooks/useKeyDown';
import NotFound from 'scenes/NotFound/NotFound';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import useDisplayFullPageNftDetailModal from 'scenes/NftDetailPage/useDisplayFullPageNftDetailModal';
import { useModalState } from 'contexts/modal/ModalContext';
import { UserActivityLayout } from './UserActivityLayout';
import { UserActivityFragment$key } from '__generated__/UserActivityFragment.graphql';

type Props = {
  queryRef: UserActivityFragment$key;
};

function UserActivity({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment UserActivityFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
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

            ...UserActivityLayoutFragment
          }
          ... on ErrUserNotFound {
            __typename
            message
          }
        }

        ...UserActivityLayoutQueryFragment
      }
    `,
    queryRef
  );

  const { user } = query;
  const { push } = useRouter();

  const galleryId = query.viewer?.viewerGalleries?.[0]?.gallery?.dbid;

  const loggedInUserId = query.viewer?.user?.dbid;
  const isLoggedIn = Boolean(loggedInUserId);

  const { isModalOpenRef } = useModalState();

  const navigateToEdit = useCallback(() => {
    if (!isLoggedIn) return;
    if (isModalOpenRef.current) return;
    void push(`/gallery/${galleryId}/edit`);
  }, [isLoggedIn, isModalOpenRef, push, galleryId]);

  useKeyDown('e', navigateToEdit);

  useDisplayFullPageNftDetailModal();

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return <UserActivityLayout userRef={user} queryRef={query} />;
}

export default UserActivity;
