import Head from 'next/head';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import Explore from '~/components/Explore/Explore';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

import { CmsTypes } from '../ContentPages/cms_types';

type Props = {
  gallerySelectsContent: CmsTypes.ExplorePageGallerySelectsList;
};

export default function ExploreHomePage({ gallerySelectsContent }: Props) {
  const navbarHeight = useGlobalNavbarHeight();

  return (
    <>
      <Head>
        <title>Gallery | Explore</title>
      </Head>
      <StyledPage navbarHeight={navbarHeight}>
        <Explore gallerySelectsContent={gallerySelectsContent} />
      </StyledPage>
    </>
  );
}

const StyledPage = styled.div<{ navbarHeight: number }>`
  display: flex;
  flex-direction: column;

  padding-top: ${({ navbarHeight }) => navbarHeight}px;
  min-height: 100vh;

  margin-left: ${pageGutter.mobile}px;
  margin-right: ${pageGutter.mobile}px;
  justify-content: flex-start;
  align-items: center;
  max-width: 100vw;

  @media only screen and ${breakpoints.tablet} {
    margin-left: ${pageGutter.tablet}px;
    margin-right: ${pageGutter.tablet}px;
  }

  @media only screen and ${breakpoints.desktop} {
    max-width: 1336px;
    margin: 0 auto;
    padding: ${({ navbarHeight }) => navbarHeight}px 32px 0;
  }
`;
