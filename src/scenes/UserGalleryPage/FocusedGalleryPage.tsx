import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { FocusedGalleryPageFragment$key } from '~/generated/FocusedGalleryPageFragment.graphql';
import { GalleryPageSpacing } from '~/pages/[username]';
import { UserGalleryLayout } from '~/scenes/UserGalleryPage/UserGalleryLayout';

type FocusedGalleryPageProps = {
  queryRef: FocusedGalleryPageFragment$key;
};

export function FocusedGalleryPage({ queryRef }: FocusedGalleryPageProps) {
  const query = useFragment(
    graphql`
      fragment FocusedGalleryPageFragment on Query {
        ...UserGalleryLayoutQueryFragment

        galleryById(id: $galleryId) {
          ... on Gallery {
            __typename
            name
            owner {
              username
            }

            ...UserGalleryLayoutFragment
          }
        }
      }
    `,
    queryRef
  );

  if (query.galleryById?.__typename !== 'Gallery') {
    throw new Error('Yikes');
  }

  const username = query.galleryById.owner?.username ?? '<unknown>';

  let headTitle = `${username} | Gallery`;
  if (query.galleryById.name) {
    headTitle = `${username} | ${query.galleryById.name} | Gallery`;
  }

  const track = useTrack();
  const navbarHeight = useGlobalNavbarHeight();

  useEffect(() => {
    track('Page View: User Gallery', { username }, true);
  }, [username, track]);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <GalleryPageSpacing>
        <UserGalleryLayout galleryRef={query.galleryById} queryRef={query} />
      </GalleryPageSpacing>
    </>
  );
}
