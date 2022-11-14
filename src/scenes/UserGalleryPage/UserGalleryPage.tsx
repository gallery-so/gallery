import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { UserGalleryPageFragment$key } from '~/generated/UserGalleryPageFragment.graphql';

import useVerifyEmailOnPage from '../../components/Email/useVerifyEmailOnPage';
import UserGallery from './UserGallery';

type UserGalleryPageProps = {
  queryRef: UserGalleryPageFragment$key;
  username: string;
};

function UserGalleryPage({ queryRef, username }: UserGalleryPageProps) {
  const query = useFragment(
    graphql`
      fragment UserGalleryPageFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }

        ...UserGalleryFragment
        ...SettingsModalFragment
        ...useVerifyEmailOnPageQueryFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const headTitle = `${username} | Gallery`;

  const track = useTrack();
  const navbarHeight = useGlobalNavbarHeight();

  useVerifyEmailOnPage(query);

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

export const StyledUserGalleryPage = styled.div<{ navbarHeight: number }>`
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
