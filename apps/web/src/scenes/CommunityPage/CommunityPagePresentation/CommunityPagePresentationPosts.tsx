import { useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { CommunityPagePresentationPostsFragment$key } from '~/generated/CommunityPagePresentationPostsFragment.graphql';
import { CommunityPagePresentationPostsQueryFragment$key } from '~/generated/CommunityPagePresentationPostsQueryFragment.graphql';
import { RefetchableCommunityPresentationPostsQuery } from '~/generated/RefetchableCommunityPresentationPostsQuery.graphql';

import CommunityPagePresentationEmptyState from './CommunityPagePresentationEmptyState';
import CommunityPagePresentationPostsCycle from './CommunityPagePresentationPostsCycle';

type Props = {
  communityRef: CommunityPagePresentationPostsFragment$key;
  queryRef: CommunityPagePresentationPostsQueryFragment$key;
};

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
        # we use these fields where we use this fragment
        # eslint-disable-next-line relay/unused-fields
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
                ...CommunityPagePresentationPostsCycleFragment
              }
            }
          }
          pageInfo {
            ...CommunityPagePresentationPostsCyclePageInfoFragment
          }
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
    for (const edge of community.presentationPosts?.edges ?? []) {
      if (edge?.node?.__typename === 'Post' && edge.node) {
        posts.push(edge.node);
      }
    }
    return posts;
  }, [community.presentationPosts?.edges]);

  if (!nonNullPosts.length) {
    return <CommunityPagePresentationEmptyState refetch={refetch} />;
  }

  if (!community.presentationPosts?.pageInfo) {
    return null;
  }

  return (
    <CommunityPagePresentationPostsCycle
      queryRef={query}
      postsRef={nonNullPosts}
      pageInfoRef={community.presentationPosts?.pageInfo}
      loadNext={loadNext}
    />
  );
}
