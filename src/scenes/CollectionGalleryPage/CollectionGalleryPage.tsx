import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Page from 'components/core/Page/Page';
import styled from 'styled-components';
import Head from 'next/head';
import CollectionGallery from './CollectionGallery';
import useBackButton from 'hooks/useBackButton';
import ActionText from 'components/core/ActionText/ActionText';
import { useEffect } from 'react';
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

  const ePress = useKeyDown('e');

  // FIXME: Do we also want the escape/backspace keypress to trigger navigation to /{username}? Not in spec
  const escapePress = useKeyDown('Escape');
  const backspacePress = useKeyDown('Backspace');
  const { push } = useRouter();

  useEffect(() => {
    const navigateToEdit = function () {
      void push(`/edit?collectionId=${collectionId}`);
    };
    const navigateToUserGallery = function () {
      void push(`/${username}`);
    };
    if (ePress) {
      navigateToEdit();
    }
    if (escapePress || backspacePress) {
      navigateToUserGallery();
    }
  }, [ePress, escapePress, backspacePress, push, username, collectionId]);

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
