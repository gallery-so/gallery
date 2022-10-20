import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import NotFound from 'scenes/NotFound/NotFound';
import styled from 'styled-components';
import { CommunityPageFragment$key } from '__generated__/CommunityPageFragment.graphql';
import CommunityPageView from './CommunityPageView';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

type Props = {
  queryRef: CommunityPageFragment$key;
};

export default function CommunityPage({ queryRef }: Props) {
  const { community } = useFragment(
    graphql`
      fragment CommunityPageFragment on Query {
        community: communityByAddress(
          communityAddress: $communityAddress
          forceRefresh: $forceRefresh
        ) {
          ... on ErrCommunityNotFound {
            __typename
          }
          ... on Community {
            __typename
            name
            ...CommunityPageViewFragment
          }
        }
      }
    `,
    queryRef
  );

  const track = useTrack();
  const navbarHeight = useGlobalNavbarHeight();

  useEffect(() => {
    if (community && community.__typename === 'Community') {
      track('Page View: Community', { name: community.name });
    }
  }, [community, track]);

  if (!community || community.__typename !== 'Community') {
    return (
      <StyledNotFoundPage navbarHeight={navbarHeight}>
        <NotFound resource="community" />
      </StyledNotFoundPage>
    );
  }

  const headTitle = community.name ? `${community.name} | Gallery` : 'Gallery';

  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledPage navbarHeight={navbarHeight}>
        <CommunityPageView communityRef={community} />
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

const StyledNotFoundPage = styled(StyledPage)`
  align-items: center;
  justify-content: center;
`;
