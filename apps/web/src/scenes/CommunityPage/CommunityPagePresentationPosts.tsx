import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchQuery,
  graphql,
  useFragment,
  usePaginationFragment,
  useRelayEnvironment,
} from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleCondensed } from '~/components/core/Text/Text';
import { PostItem } from '~/components/Feed/PostItem';
import { CommunityPagePresentationPostsFragment$key } from '~/generated/CommunityPagePresentationPostsFragment.graphql';
import { RefetchableCommunityPresentationPostsQuery } from '~/generated/RefetchableCommunityPresentationPostsQuery.graphql';
import useWindowSize from '~/hooks/useWindowSize';

import CommunityPagePresentationEmptyState from './CommunityPagePresentation/CommunityPagePresentationEmptyState';
import CommunityPagePresentationPostsCycle from './CommunityPagePresentation/CommunityPagePresentationPostsCycle';

type Props = {
  communityRef: CommunityPagePresentationPostsFragment$key;
  queryRef: any;
};

// instead of hasnext, use total?

export const fetchPageQuery = graphql`
  query CommunityPagePresentationPostsHasNextPageQuery(
    $communityAddress: ChainAddressInput!
    $forceRefresh: Boolean!
    $communityPostsAfter: String
    $communityPostsFirst: Int
  ) {
    community: communityByAddress(
      communityAddress: $communityAddress
      forceRefresh: $forceRefresh
    ) {
      ... on Community {
        __typename
        postsPageInfo: posts(after: $communityPostsAfter, first: $communityPostsFirst) {
          pageInfo {
            hasNextPage
            startCursor
            endCursor
            total
          }
        }
      }
      ... on ErrCommunityNotFound {
        __typename
      }
    }
  }
`;

export default function CommunityPagePresentationPosts({ communityRef, queryRef }: Props) {
  const {
    data: community,
    loadNext,
    refetch,
  } = usePaginationFragment<
    RefetchableCommunityPresentationPostsQuery,
    CommunityPagePresentationPostsFragment$key
  >(
    graphql`
      fragment CommunityPagePresentationPostsFragment on Community
      @refetchable(queryName: "RefetchableCommunityPresentationPostsQuery") {
        presentationPosts: posts(after: $communityPostsAfter, first: $communityPostsFirst)
          @connection(key: "CommunityFeed_presentationPosts") {
          edges {
            node {
              ... on Post {
                __typename
                id
                # ...CommunityPagePresentationPostsPostFragment
                # ...CommunityPagePostCycleFragment
                ...CommunityPagePresentationPostsCycleFragment
              }
            }
          }
          pageInfo {
            ...CommunityPagePresentationPostsCyclePageInfoFragment
          }
        }
        contractAddress {
          address
        }
      }
    `,
    communityRef
  );
  const query = useFragment(
    graphql`
      fragment CommunityPagePresentationPostsQueryFragment on Query {
        ...CommunityPagePresentationPostsCycleQueryFragment
      }
    `,
    queryRef
  );

  const nonNullPosts = useMemo(() => {
    const posts = [];
    for (const edge of community.presentationPosts?.edges) {
      if (edge?.node?.__typename === 'Post' && edge.node) {
        posts.push(edge.node);
      }
    }
    return posts;
  }, [community.presentationPosts?.edges]);

  if (!nonNullPosts.length) {
    return (
      <CommunityPagePresentationEmptyState refetch={refetch} />
      // <StyledEmptyState justify="center" gap={84}>
      //   <StyledEmptyStateText>Mint to join the conversation</StyledEmptyStateText>
      //   <StyledEmptyStateText>[ insert QR code ]</StyledEmptyStateText>
      // </StyledEmptyState>
    );
  }

  return (
    <CommunityPagePresentationPostsCycle
      queryRef={query}
      postsRef={nonNullPosts}
      pageInfoRef={community.presentationPosts.pageInfo}
      loadNext={loadNext}
    />
  );
}
