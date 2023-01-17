import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { GalleryPageQueryFragment$key } from '~/generated/GalleryPageQueryFragment.graphql';

import { StyledUserGalleryPage } from '../UserGalleryPage/UserGalleryPage';
import GalleryPageView from './GalleryPageView';

type GalleryPageProps = {
  galleryId: string;
  queryRef: GalleryPageQueryFragment$key;
  username: string;
};

function GalleryPage({ galleryId, queryRef, username }: GalleryPageProps) {
  const query = useFragment(
    graphql`
      fragment GalleryPageQueryFragment on Query {
        ...GalleryPageViewFragment
      }
    `,
    queryRef
  );

  const headTitle = `${username} | Gallery`;

  const track = useTrack();
  const navbarHeight = useGlobalNavbarHeight();

  useEffect(() => {
    track('Page View: Gallery', { username }, true);
  }, [username, track]);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledUserGalleryPage navbarHeight={navbarHeight}>
        <GalleryPageView galleryId={galleryId} queryRef={query} />
      </StyledUserGalleryPage>
    </>
  );
}

export default GalleryPage;
