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

type CollectionGalleryPageProps = {
  username: string;
  collectionId: string;
};

function CollectionGalleryPage({ collectionId, username }: CollectionGalleryPageProps) {
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

  const { push } = useRouter();
  const navigateToEdit = function () {
    void push(`/edit?collectionId=${collectionId}`);
  };

  // FIXME: Do we also want escape/backspace to go back to main /{username} page? Not in spec
  const escapePress = useKeyDown('Escape');
  const backspacePress = useKeyDown('Backspace');
  const navigateToUserGallery = function () {
    void push(`/${username}`);
  };

  useEffect(() => {
    if (ePress) {
      navigateToEdit();
    }
    if (escapePress || backspacePress) {
      navigateToUserGallery();
    }
  }, [ePress, escapePress, backspacePress]);

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
          <CollectionGallery collectionId={collectionId} />
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
