import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { FocusedGalleryPageFragment$key } from '~/generated/FocusedGalleryPageFragment.graphql';
import { UserGalleryLayout } from '~/scenes/UserGalleryPage/UserGalleryLayout';

type FocusedGalleryPageProps = {
  queryRef: FocusedGalleryPageFragment$key;
};

export function FocusedGalleryPage({ queryRef }: FocusedGalleryPageProps) {
  const query = useFragment(
    graphql`
      fragment FocusedGalleryPageFragment on Query {
        ...UserGalleryLayoutQueryFragment

        galleryById(id: $galleryId) {
          ... on Gallery {
            __typename
            name
            owner {
              username
            }

            ...UserGalleryLayoutFragment
          }
        }
      }
    `,
    queryRef
  );

  if (query.galleryById?.__typename !== 'Gallery') {
    throw new Error('Yikes');
  }

  const username = query.galleryById.owner?.username ?? '<unknown>';

  let headTitle = `${username} | Gallery`;
  if (query.galleryById.name) {
    headTitle = `${username} | ${query.galleryById.name} | Gallery`;
  }

  const track = useTrack();
  const navbarHeight = useGlobalNavbarHeight();

  useEffect(() => {
    track('Page View: User Gallery', { username }, true);
  }, [username, track]);

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledUserGalleryPage navbarHeight={navbarHeight}>
        <UserGalleryLayout galleryRef={query.galleryById} queryRef={query} />
      </StyledUserGalleryPage>
    </>
  );
}

export const StyledUserGalleryPage = styled.div<{ navbarHeight: number }>`
  display: flex;
  justify-content: center;
  min-height: 100vh;

  margin: 0 ${pageGutter.mobile}px 24px;
  padding-top: ${({ navbarHeight }) => navbarHeight + 10}px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
    padding-top: ${({ navbarHeight }) => navbarHeight + 24}px;
  }
`;
