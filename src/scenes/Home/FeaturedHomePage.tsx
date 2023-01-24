import Head from 'next/head';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import Featured from '~/components/Featured/Featured';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { FeaturedHomePageFragment$key } from '~/generated/FeaturedHomePageFragment.graphql';

type Props = {
  queryRef: FeaturedHomePageFragment$key;
};

export default function FeaturedHomePage({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment FeaturedHomePageFragment on Query {
        ...FeaturedFragment
      }
    `,
    queryRef
  );

  const navbarHeight = useGlobalNavbarHeight();

  return (
    <>
      <Head>
        <title>Gallery - Featured</title>
      </Head>
      <StyledPage navbarHeight={navbarHeight}>
        <Featured queryRef={query} />
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
