import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserGalleryPageFragment$key } from '~/generated/UserGalleryPageFragment.graphql';
import { GalleryPageSpacing } from '~/pages/[username]';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

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
