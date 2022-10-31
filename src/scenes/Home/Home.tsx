import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Feed from 'components/Feed/Feed';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';
import Head from 'next/head';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { HomeFragment$key } from '__generated__/HomeFragment.graphql';

type Props = {
  queryRef: HomeFragment$key;
};

export default function Home({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment HomeFragment on Query {
        ...FeedViewerFragment
      }
    `,
    queryRef
  );

  return (
    <>
      <Head>
        <title>Gallery - Home</title>
      </Head>
      <StyledPage>
        <Feed queryRef={query} />
      </StyledPage>
    </>
  );
}

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;

  padding-top: ${GLOBAL_NAVBAR_HEIGHT}px;
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
    max-width: 1200px;
    margin: 0 auto;
    padding: ${GLOBAL_NAVBAR_HEIGHT}px 32px 0;
  }
`;
