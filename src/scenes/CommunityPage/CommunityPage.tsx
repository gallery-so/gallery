import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { GLOBAL_NAVBAR_HEIGHT } from 'contexts/globalLayout/GlobalNavbar/GlobalNavbar';
import Head from 'next/head';
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import NotFound from 'scenes/NotFound/NotFound';
import styled from 'styled-components';
import { CommunityPageFragment$key } from '__generated__/CommunityPageFragment.graphql';
import CommunityPageView from './CommunityPageView';

type Props = {
  queryRef: CommunityPageFragment$key;
};

export default function CommunityPage({ queryRef }: Props) {
  const query = useFragment(
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
  const { community } = query;
  const track = useTrack();

  useEffect(() => {
    if (community && community.__typename === 'Community') {
      track('Page View: Community', { name: community.name });
    }
  }, [community, track]);

  if (!community || community.__typename !== 'Community') {
    return (
      <StyledNotFoundPage>
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
      <StyledPage>
        <CommunityPageView communityRef={community} />
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

const StyledNotFoundPage = styled(StyledPage)`
  align-items: center;
  justify-content: center;
`;
