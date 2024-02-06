import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';

import { useModalState } from '~/contexts/modal/ModalContext';
import { CollectionGalleryPageFragment$key } from '~/generated/CollectionGalleryPageFragment.graphql';
import useKeyDown from '~/hooks/useKeyDown';
import { GalleryPageSpacing } from '~/pages/[username]';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import { MobileSpacingContainer } from '../UserGalleryPage/UserGallery';
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
    track(
      'Page View: Collection',
      {
        username,
        collectionId,
      },
      true
    );
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
        pathname: '/gallery/[galleryId]/edit',
        query: { galleryId, collectionId },
      });
    } else {
      void push({ pathname: '/gallery/[galleryId]/edit', query: { galleryId } });
    }
  }, [isLoggedIn, isModalOpenRef, userOwnsCollection, push, galleryId, collectionId]);

  useKeyDown('e', navigateToEdit);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <GalleryPageSpacing>
        <MobileSpacingContainer>
          <CollectionGallery queryRef={query} />
        </MobileSpacingContainer>
      </GalleryPageSpacing>
    </>
  );
}

export default CollectionGalleryPage;
