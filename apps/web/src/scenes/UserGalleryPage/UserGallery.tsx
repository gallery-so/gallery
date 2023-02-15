import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { ClickablePill } from '~/components/Pill';
import { useModalState } from '~/contexts/modal/ModalContext';
import { UserGalleryFragment$key } from '~/generated/UserGalleryFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import TwitterIcon from '~/icons/Twittericon';
import useDisplayFullPageNftDetailModal from '~/scenes/NftDetailPage/useDisplayFullPageNftDetailModal';
import NotFound from '~/scenes/NotFound/NotFound';
import { UserGalleryLayout } from '~/scenes/UserGalleryPage/UserGalleryLayout';
import { UserNameAndDescriptionHeader } from '~/scenes/UserGalleryPage/UserNameAndDescriptionHeader';

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

            featuredGallery @required(action: THROW) {
              ...UserGalleryLayoutFragment
            }

            ...UserNameAndDescriptionHeader
          }
          ... on ErrUserNotFound {
            __typename
          }
        }

        ...UserGalleryLayoutQueryFragment
        ...UserNameAndDescriptionHeaderQueryFragment
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
    void push({ pathname: '/gallery/[galleryId]/edit', query: { galleryId: galleryId as string } });
  }, [isLoggedIn, isModalOpenRef, push, galleryId]);

  useKeyDown('e', navigateToEdit);
  useDisplayFullPageNftDetailModal();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return (
    <VStack gap={isMobile ? 12 : 24}>
      <VStack gap={12}>
        <UserNameAndDescriptionHeader userRef={user} queryRef={query} />

        <HStack align="flex-start">
          <ClickablePill href="https://twitter.com/i/oauth2/authorize?response_type=code&client_id=T0RhNDBVSWdVVGh2ZzBOdHJobHA6MTpjaQ&redirect_uri=http://localhost:3000/auth/twitter&scope=tweet.read%20users.read%20follows.read%20follows.write%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain">
            <HStack gap={5} align="center">
              <TwitterIcon />
              <strong>Connect Twitter</strong>
            </HStack>
          </ClickablePill>
        </HStack>
      </VStack>

      <Divider />
      <UserGalleryLayout galleryRef={user.featuredGallery} queryRef={query} />
    </VStack>
  );
}

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e7e7e7;
`;

export default UserGallery;
