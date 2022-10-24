import Head from 'next/head';
import { useEffect } from 'react';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import UserActivity from './UserActivity';
import { UserActivityPageFragment$key } from '__generated__/UserActivityPageFragment.graphql';
import { StyledUserGalleryPage } from 'scenes/UserGalleryPage/UserGalleryPage';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

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
  const navbarHeight = useGlobalNavbarHeight();

  useEffect(() => {
    track('Page View: User Gallery', { username });
  }, [username, track]);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledUserGalleryPage navbarHeight={navbarHeight}>
        <UserActivity queryRef={query} />
      </StyledUserGalleryPage>
    </>
  );
}

export default UserActivityPage;
