import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Page from 'components/core/Page/Page';
import styled from 'styled-components';
import Head from 'next/head';
import CollectionGallery from './CollectionGallery';

type CollectionGalleryPageProps = {
  username: string;
  collectionId: string;
};

function CollectionGalleryPage({ collectionId, username }: CollectionGalleryPageProps) {
  const headTitle = `${username} | Gallery`;

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta property="og:title" content={headTitle} key="og:title" />
        <meta name="twitter:title" content={headTitle} key="twitter:title" />
      </Head>
      <Page>
        <StyledCollectionGalleryWrapper>
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
