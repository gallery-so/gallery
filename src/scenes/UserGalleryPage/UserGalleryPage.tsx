import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Page from 'components/core/Page/Page';
import styled from 'styled-components';

import UserGallery from './UserGallery';
import UserGalleryPageErrorBoundary from './UserGalleryPageErrorBoundary';
import Head from 'next/head';
import { useEffect } from 'react';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type UserGalleryPageProps = {
  username: string;
};

function UserGalleryPage({ username }: UserGalleryPageProps) {
  const headTitle = `${username} | Gallery`;

  const track = useTrack();

  useEffect(() => {
    track('Page View: User Gallery', { username });
  }, [username, track]);

  return (
    <UserGalleryPageErrorBoundary>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <Page>
        <StyledUserGalleryWrapper>
          <UserGallery username={username} />
        </StyledUserGalleryWrapper>
      </Page>
    </UserGalleryPageErrorBoundary>
  );
}

const StyledUserGalleryWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

export default UserGalleryPage;
