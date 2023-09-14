import Head from 'next/head';
import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { CommunityPagePresentationSceneFragment$key } from '~/generated/CommunityPagePresentationSceneFragment.graphql';
import NotFound from '~/scenes/NotFound/NotFound';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

import CommunityPagePresentation from './CommunityPagePresentation';

type Props = {
  queryRef: CommunityPagePresentationSceneFragment$key;
};

export enum CommunityPageDisplayMode {
  PRESENTATION = 'presentation',
}

// Optimized for 75" TV
export default function CommunityPagePresentationScene({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityPagePresentationSceneFragment on Query {
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
            ...CommunityPagePresentationFragment
          }
        }
        ...CommunityPagePresentationQueryFragment
      }
    `,
    queryRef
  );
  const { community } = query;
  const track = useTrack();

  useEffect(() => {
    if (community && community.__typename === 'Community') {
      track('Page View: Community', { name: community.name }, true);
    }
  }, [community, track]);

  if (!community || community.__typename !== 'Community') {
    return <NotFound resource="community" />;
  }

  const headTitle = community.name ? `${community.name} | Gallery` : 'Gallery';
  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledPage>
        <CommunityPagePresentation communityRef={community} queryRef={query} />
      </StyledPage>
    </>
  );
}

const StyledPage = styled(VStack)`
  border: 1px solid red;
  height: 100vh;
  font-size: 64px;
`;
