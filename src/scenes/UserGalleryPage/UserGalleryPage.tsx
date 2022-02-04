import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Page from 'components/core/Page/Page';
import styled from 'styled-components';

import UserGallery from './UserGallery';
import UserGalleryPageErrorBoundary from './UserGalleryPageErrorBoundary';
import Head from 'next/head';
import { baseUrl } from 'utils/baseUrl';
import { useEffect } from 'react';
import Mixpanel from 'utils/mixpanel';

type UserGalleryPageProps = {
  username: string;
};

function UserGalleryPage({ username }: UserGalleryPageProps) {
  const headTitle = `${username} | Gallery`;

  useEffect(() => {
    Mixpanel.track('Page View: User Gallery', { username });
  }, [username]);

  return (
    <UserGalleryPageErrorBoundary>
      <Head>
        <title>{headTitle}</title>
        <meta property="og:title" content={headTitle} key="og:title" />
        <meta name="twitter:title" content={headTitle} key="twitter:title" />
        <meta
          name="og:image"
          content={`${baseUrl}/api/opengraph/image?${new URLSearchParams({
            path: `/opengraph/user/${username}`,
          }).toString()}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
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
