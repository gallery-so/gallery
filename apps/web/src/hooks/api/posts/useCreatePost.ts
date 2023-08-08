import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql } from 'react-relay';
import { ConnectionHandler, SelectorStoreUpdater } from 'relay-runtime';

import { useCreatePostMutation } from '~/generated/useCreatePostMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type TokenToPost = {
  dbid: string;
  communityId: string;
};

type InputProps = {
  tokens: TokenToPost[];
  caption?: string;
};

export default function useCreatePost() {
  const [createPost] = usePromisifiedMutation<useCreatePostMutation>(
    graphql`
      mutation useCreatePostMutation($input: PostTokensInput!) {
        postTokens(input: $input) {
          __typename
          ... on PostTokensPayload {
            post {
              __typename
              tokens {
                community {
                  contractAddress {
                    address
                  }
                }
              }
              ...PostHeaderFragment
              ...PostNftsFragment
            }
          }
        }
      }
    `
  );

  const router = useRouter();
  const reportError = useReportError();

  return useCallback(
    async (input: InputProps) => {
      const token = input.tokens[0];

      if (!token) return;
      const updater: SelectorStoreUpdater<useCreatePostMutation['response']> = (
        store,
        response
      ) => {
        // We currently only support posting one token at a time

        // Insert the new post into the feeds in the relay store so that it appears immediately
        if (response?.postTokens?.__typename === 'PostTokensPayload') {
          // Get the new post record
          const newPostRootField = store.getRootField('postTokens');
          const newPostRecord = newPostRootField?.getLinkedRecord('post');

          // UPDATE COMMUNITY FEED
          // Get a reference to current posts in the community feed
          const communityRoot = store.get(token.communityId);

          if (communityRoot) {
            const communityFeedPosts = ConnectionHandler.getConnection(
              communityRoot,
              'CommunityFeed_posts'
            );

            // Insert post into community feed
            if (newPostRecord && communityFeedPosts) {
              const edge = ConnectionHandler.createEdge(
                store,
                communityFeedPosts,
                newPostRecord,
                'PostEdge'
              );

              ConnectionHandler.insertEdgeAfter(communityFeedPosts, edge);
            }

            // Increment the displayed total number of posts in the community.
            // This count is a different record from the actual feed because we retrieve the count separately
            const communityFeedPostsCountPageInfo = communityRoot
              .getLinkedRecord('posts(last:0)')
              ?.getLinkedRecord('pageInfo');

            communityFeedPostsCountPageInfo?.setValue(
              ((communityFeedPostsCountPageInfo?.getValue('total') as number) ?? 0) + 1,
              'total'
            );
          }
        }
      };

      try {
        const response = await createPost({
          updater,
          variables: { input: { tokenIds: [token.dbid], caption: input.caption } },
        });
        if (response.postTokens?.__typename === 'PostTokensPayload') {
          // Upon successful post, redirect the user depending on the current page
          const pathname = router.pathname;

          // We current only support posting one token at a time, so we currently use the first token in the list.
          const communityAddressOfPostedToken =
            response.postTokens.post.tokens &&
            response.postTokens.post.tokens[0]?.community?.contractAddress?.address;

          // If the user is on the community page of the token they posted, stay on that page.
          const stayOnCommunityPage =
            communityAddressOfPostedToken && router.asPath.includes(communityAddressOfPostedToken);

          if (!stayOnCommunityPage && !['/home', '/latest'].includes(pathname)) {
            router.push('/latest');
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError(`Could not admire post for an unknown reason`);
        }
      }
    },
    [createPost, reportError, router]
  );
}
