import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { useModalState } from '~/contexts/modal/ModalContext';
import { UserGalleryFragment$key } from '~/generated/UserGalleryFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import NotFound from '~/scenes/NotFound/NotFound';
import { UserGalleryLayout } from '~/scenes/UserGalleryPage/UserGalleryLayout';

import UserGalleryHeader from './UserGalleryHeader';

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
            dbid

            featuredGallery @required(action: THROW) {
              ...UserGalleryLayoutFragment
            }

            ...UserGalleryHeaderFragment
          }
          ... on ErrUserNotFound {
            __typename
          }
        }

        ...UserGalleryLayoutQueryFragment
        ...UserGalleryHeaderQueryFragment
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

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  if (user.__typename === 'ErrUserNotFound') {
    return <NotFound />;
  }

  if (user.__typename !== 'GalleryUser') {
    throw new Error(`Expected user to be type GalleryUser. Received: ${user.__typename}`);
  }

  return (
    <VStack gap={isMobile ? 12 : 24}>
      <UserGalleryHeader userRef={user} queryRef={query} />
      <MobileSpacingContainer>
        <UserGalleryLayout galleryRef={user.featuredGallery} queryRef={query} />
      </MobileSpacingContainer>
    </VStack>
  );
}

export const MobileSpacingContainer = styled(VStack)`
  margin: 0 ${pageGutter.mobile}px 24px;

  @media (min-width: ${breakpoints.mobile}px) {
    margin: 0;
  }
`;

export default UserGallery;
