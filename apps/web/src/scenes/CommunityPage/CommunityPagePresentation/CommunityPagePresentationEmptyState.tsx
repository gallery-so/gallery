import { useEffect } from 'react';
import { fetchQuery, RefetchFnDynamic, useRelayEnvironment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed } from '~/components/core/Text/Text';
import { CommunityPagePresentationPostsFragment$key } from '~/generated/CommunityPagePresentationPostsFragment.graphql';
import { CommunityPagePresentationPostsHasNextPageQuery } from '~/generated/CommunityPagePresentationPostsHasNextPageQuery.graphql';
import { RefetchableCommunityPresentationPostsQuery } from '~/generated/RefetchableCommunityPresentationPostsQuery.graphql';

import { fetchPageQuery } from './CommunityPagePresentationPosts';

const POLL_FOR_POST_INTERVAL_MS = 5000;

type Props = {
  refetch: RefetchFnDynamic<
    RefetchableCommunityPresentationPostsQuery,
    CommunityPagePresentationPostsFragment$key
  >;
};

export default function CommunityPagePresentationEmptyState({ refetch }: Props) {
  // poll for the first post

  const relayEnvironment = useRelayEnvironment();

  // Poll to check if any Posts have been created
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const data = await fetchQuery<CommunityPagePresentationPostsHasNextPageQuery>(
        relayEnvironment,
        fetchPageQuery,
        {
          communityAddress: {
            address: '0x7e619a01e1a3b3a6526d0e01fbac4822d48f439b',
            chain: 'Ethereum',
          },
          communityPostsFirst: 1,
          forceRefresh: false,
        }
      ).toPromise();

      if (data?.community?.__typename !== 'Community') {
        return;
      }

      // if there are Posts, refetch the query to get the first Post.
      if (
        data?.community?.postsPageInfo?.pageInfo?.total &&
        data?.community?.postsPageInfo?.pageInfo?.total > 0
      ) {
        refetch({}, { fetchPolicy: 'network-only' });
      }
    }, POLL_FOR_POST_INTERVAL_MS);

    return () => {
      console.log('clearing');
      clearInterval(intervalId);
    };
  }, [refetch, relayEnvironment]);

  return (
    <StyledEmptyState justify="center" gap={84}>
      <StyledEmptyStateText>Mint to join the conversation</StyledEmptyStateText>
      <StyledEmptyStateText>[ insert QR code ]</StyledEmptyStateText>
    </StyledEmptyState>
  );
}

const StyledEmptyState = styled(VStack)`
  height: 100%;
`;
const StyledEmptyStateText = styled(TitleCondensed)`
  font-size: 120px;
  line-height: 120px;
`;
