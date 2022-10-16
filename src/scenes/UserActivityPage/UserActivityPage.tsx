import breakpoints, { pageGutter } from 'components/core/breakpoints';
import styled from 'styled-components';

import Head from 'next/head';
import { useEffect } from 'react';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';
import UserActivity from './UserActivity';
import { UserActivityPageFragment$key } from '__generated__/UserActivityPageFragment.graphql';

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
    track('Page View: User Gallery', { username });
  }, [username, track]);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledUserGalleryPage>
        <UserActivity queryRef={query} />
      </StyledUserGalleryPage>
    </>
  );
}

const StyledUserGalleryPage = styled.div`
  display: flex;
  justify-content: center;
  padding-top: ${GLOBAL_NAVBAR_HEIGHT}px;
  min-height: 100vh;

  display: flex;
  justify-content: center;
  margin: 0 ${pageGutter.mobile}px 24px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

export default UserActivityPage;
