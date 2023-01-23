import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { UserGalleryPageFragment$key } from '~/generated/UserGalleryPageFragment.graphql';
import { GalleryPageSpacing } from '~/pages/[username]';

import UserGallery from './UserGallery';

type UserGalleryPageProps = {
  queryRef: UserGalleryPageFragment$key;
  username: string;
};

function UserGalleryPage({ queryRef, username }: UserGalleryPageProps) {
  const query = useFragment(
    graphql`
      fragment UserGalleryPageFragment on Query {
        ...UserGalleryFragment
      }
    `,
    queryRef
  );

  const headTitle = `${username} | Gallery`;

  const track = useTrack();

  useEffect(() => {
    track('Page View: User Gallery', { username }, true);
  }, [username, track]);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <GalleryPageSpacing>
        <UserGallery queryRef={query} />
      </GalleryPageSpacing>
    </>
  );
}

export default UserGalleryPage;
