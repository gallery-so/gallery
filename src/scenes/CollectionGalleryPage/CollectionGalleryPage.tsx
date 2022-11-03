import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { useModalState } from '~/contexts/modal/ModalContext';
import { CollectionGalleryPageFragment$key } from '~/generated/CollectionGalleryPageFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import useDisplayFullPageNftDetailModal from '~/scenes/NftDetailPage/useDisplayFullPageNftDetailModal';

import CollectionGallery from './CollectionGallery';

type CollectionGalleryPageProps = {
  username: string;
  queryRef: CollectionGalleryPageFragment$key;
};

function CollectionGalleryPage({ username, queryRef }: CollectionGalleryPageProps) {
  const headTitle = `${username} | Gallery`;

  const query = useFragment(
    graphql`
      fragment CollectionGalleryPageFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
        collection: collectionById(id: $collectionId) {
          ... on ErrCollectionNotFound {
            __typename
          }

          ... on Collection {
            __typename
            dbid

            gallery @required(action: THROW) {
              dbid
            }
          }
        }
        ...CollectionGalleryFragment
      }
    `,
    queryRef
  );

  if (query?.collection?.__typename !== 'Collection') {
    throw new Error('CollectionGalleryPage expected valid Collection');
  }

  const {
    collection: {
      dbid: collectionId,
      gallery: { dbid: galleryId },
    },
  } = query;

  const track = useTrack();

  useEffect(() => {
    track('Page View: Collection', {
      username,
      collectionId,
    });
  }, [username, collectionId, track]);

  const { push } = useRouter();

  const userOwnsCollection = Boolean(query?.viewer?.user?.username === username);
  const isLoggedIn = Boolean(query?.viewer?.user?.username);

  const { isModalOpenRef } = useModalState();

  const navigateToEdit = useCallback(() => {
    if (!isLoggedIn) return;
    if (isModalOpenRef.current) return;
    if (userOwnsCollection) {
      void push({
        pathname: '/gallery/[galleryId]/collection/[collectionId]/edit',
        query: { galleryId, collectionId },
      });
    } else {
      void push({ pathname: '/gallery/[galleryId]/edit', query: { galleryId } });
    }
  }, [isLoggedIn, isModalOpenRef, userOwnsCollection, push, galleryId, collectionId]);

  useKeyDown('e', navigateToEdit);

  useDisplayFullPageNftDetailModal();

  const navbarHeight = useGlobalNavbarHeight();

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledCollectionGalleryWrapper navbarHeight={navbarHeight}>
        <CollectionGallery queryRef={query} />
      </StyledCollectionGalleryWrapper>
    </>
  );
}

const StyledCollectionGalleryWrapper = styled.div<{ navbarHeight: number }>`
  padding-top: ${({ navbarHeight }) => navbarHeight}px;
  min-height: 100vh;

  display: flex;
  justify-content: center;
  margin: 0 ${pageGutter.mobile}px;
  position: relative;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

export default CollectionGalleryPage;
