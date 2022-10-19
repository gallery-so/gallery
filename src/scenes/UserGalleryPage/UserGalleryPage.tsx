import breakpoints, { pageGutter } from 'components/core/breakpoints';
import styled from 'styled-components';

import UserGallery from './UserGallery';
import Head from 'next/head';
import { useEffect } from 'react';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryPageFragment$key } from '__generated__/UserGalleryPageFragment.graphql';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

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
        <UserGallery queryRef={query} />
      </StyledUserGalleryPage>
    </>
  );
}

const StyledUserGalleryPage = styled.div<{ navbarHeight: number }>`
  display: flex;
  justify-content: center;
  padding-top: ${({ navbarHeight }) => navbarHeight}px;
  min-height: 100vh;

  display: flex;
  justify-content: center;
  margin: 0 ${pageGutter.mobile}px 24px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

export default UserGalleryPage;
