import breakpoints, { pageGutter } from 'components/core/breakpoints';
import Feed, { FeedMode } from 'components/Feed/Feed';
import Head from 'next/head';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { HomeFragment$key } from '__generated__/HomeFragment.graphql';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

type Props = {
  queryRef: HomeFragment$key;
  feedMode: FeedMode;
  setFeedMode: (mode: FeedMode) => void;
};

export default function Home({ queryRef, setFeedMode, feedMode }: Props) {
  const query = useFragment(
    graphql`
      fragment HomeFragment on Query {
        ...FeedViewerFragment
      }
    `,
    queryRef
  );

  const navbarHeight = useGlobalNavbarHeight();

  return (
    <>
      <Head>
        <title>Gallery - Home</title>
      </Head>
      <StyledPage navbarHeight={navbarHeight}>
        <Feed feedMode={feedMode} setFeedMode={setFeedMode} queryRef={query} />
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
    max-width: 1200px;
    margin: 0 auto;
    padding: ${({ navbarHeight }) => navbarHeight}px 32px 0;
  }
`;
