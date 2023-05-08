import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserActivityPageFragment$key } from '~/generated/UserActivityPageFragment.graphql';
import { GalleryPageSpacing } from '~/pages/[username]';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import UserActivity from './UserActivity';

type UserActivityPageProps = {
  queryRef: UserActivityPageFragment$key;
  username: string;
};

function UserActivityPage({ queryRef, username }: UserActivityPageProps) {
  const query = useFragment(
    graphql`
      fragment UserActivityPageFragment on Query {
        ...UserActivityFragment
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
        <UserActivity queryRef={query} />
      </GalleryPageSpacing>
    </>
  );
}

export default UserActivityPage;
