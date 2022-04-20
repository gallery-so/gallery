import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Page from 'components/core/Page/Page';
import styled from 'styled-components';
import Head from 'next/head';
import CollectionGallery from './CollectionGallery';
import useBackButton from 'hooks/useBackButton';
import ActionText from 'components/core/ActionText/ActionText';
import { useEffect, useCallback } from 'react';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import StyledBackLink from 'components/NavbarBackLink/NavbarBackLink';
import useKeyDown from 'hooks/useKeyDown';
import { useRouter } from 'next/router';

import { graphql, useFragment } from 'react-relay';

import { CollectionGalleryPageFragment$key } from '__generated__/CollectionGalleryPageFragment.graphql';

type CollectionGalleryPageProps = {
  username: string;
  collectionId: string;
  queryRef: CollectionGalleryPageFragment$key;
};

function CollectionGalleryPage({ collectionId, username, queryRef }: CollectionGalleryPageProps) {
  const headTitle = `${username} | Gallery`;
  const handleBackClick = useBackButton({ username });

  const track = useTrack();

  useEffect(() => {
    track('Page View: Collection', {
      username,
      collectionId,
    });
  }, [username, collectionId, track]);

  const { push } = useRouter();

  // FIXME: Only navigate to /edit if the user owns the current collection
  const navigateToEdit = useCallback(() => {
    void push(`/edit?collectionId=${collectionId}`);
  }, [push, collectionId]);
  const navigateToUserGallery = useCallback(() => {
    void push(`/${username}`);
  }, [push, username]);

  useKeyDown('e', navigateToEdit);
  useKeyDown('Escape', navigateToUserGallery);

  const query = useFragment(
    graphql`
      fragment CollectionGalleryPageFragment on Query {
        ...CollectionGalleryFragment
      }
    `,
    queryRef
  );

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <Page>
        <StyledCollectionGalleryWrapper>
          <StyledBackLink>
            <ActionText onClick={handleBackClick}>← Back to Gallery</ActionText>
          </StyledBackLink>
          <CollectionGallery queryRef={query} />
        </StyledCollectionGalleryWrapper>
      </Page>
    </>
  );
}

const StyledCollectionGalleryWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

export default CollectionGalleryPage;
