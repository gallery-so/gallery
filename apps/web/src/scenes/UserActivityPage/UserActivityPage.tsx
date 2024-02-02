import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { VStack } from '~/components/core/Spacer/Stack';
import { UserActivityPageFragment$key } from '~/generated/UserActivityPageFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { GalleryPageSpacing } from '~/pages/[username]';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import { MobileSpacingContainer } from '../UserGalleryPage/UserGallery';
import UserGalleryHeader from '../UserGalleryPage/UserGalleryHeader';
import UserActivity from './UserActivity';

type UserActivityPageProps = {
  queryRef: UserActivityPageFragment$key;
  username: string;
};

function UserActivityPage({ queryRef, username }: UserActivityPageProps) {
  const query = useFragment(
    graphql`
      fragment UserActivityPageFragment on Query {
        userByUsername(username: $username) {
          ...UserGalleryHeaderFragment
        }
        ...UserActivityFragment
        ...UserGalleryHeaderQueryFragment
      }
    `,
    queryRef
  );

  const headTitle = `${username} | Gallery`;

  const track = useTrack();

  useEffect(() => {
    track('Page View: User Gallery', { username }, true);
  }, [username, track]);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <GalleryPageSpacing>
        <VStack gap={isMobile ? 12 : 24}>
          {query.userByUsername && (
            <UserGalleryHeader queryRef={query} userRef={query.userByUsername} />
          )}
          <MobileSpacingContainer>
            <UserActivity queryRef={query} />
          </MobileSpacingContainer>
        </VStack>
      </GalleryPageSpacing>
    </>
  );
}

export default UserActivityPage;
