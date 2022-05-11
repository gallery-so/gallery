import breakpoints, { pageGutter } from 'components/core/breakpoints';
import styled from 'styled-components';
import Head from 'next/head';
import CollectionGallery from './CollectionGallery';
import { useEffect, useCallback } from 'react';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import useKeyDown from 'hooks/useKeyDown';
import { useRouter } from 'next/router';

import { graphql, useFragment } from 'react-relay';

import { CollectionGalleryPageFragment$key } from '__generated__/CollectionGalleryPageFragment.graphql';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/constants';

type CollectionGalleryPageProps = {
  username: string;
  collectionId: string;
  queryRef: CollectionGalleryPageFragment$key;
};

function CollectionGalleryPage({ collectionId, username, queryRef }: CollectionGalleryPageProps) {
  const headTitle = `${username} | Gallery`;

  const track = useTrack();

  useEffect(() => {
    track('Page View: Collection', {
      username,
      collectionId,
    });
  }, [username, collectionId, track]);

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
        ...CollectionGalleryFragment
      }
    `,
    queryRef
  );

  const { push } = useRouter();

  const userOwnsCollection = Boolean(query?.viewer?.user?.username === username);
  const isLoggedIn = Boolean(query?.viewer?.user?.username);

  const navigateToEdit = useCallback(() => {
    if (!isLoggedIn) return;
    if (userOwnsCollection) {
      void push(`/edit?collectionId=${collectionId}`);
    } else {
      void push(`/edit`);
    }
  }, [push, collectionId, userOwnsCollection, isLoggedIn]);

  const navigateToUserGallery = useCallback(() => {
    void push(`/${username}`);
  }, [push, username]);

  useKeyDown('e', navigateToEdit);
  useKeyDown('Escape', navigateToUserGallery);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledCollectionGalleryWrapper>
        <CollectionGallery queryRef={query} />
      </StyledCollectionGalleryWrapper>
    </>
  );
}

const StyledCollectionGalleryWrapper = styled.div`
  padding-top: ${GLOBAL_NAVBAR_HEIGHT}px;
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
