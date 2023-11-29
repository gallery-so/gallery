// useOpenGraphPostQuery.ts
import { graphql, useLazyLoadQuery } from 'react-relay';

import { useOpenGraphPostQuery } from '~/generated/useOpenGraphPostQuery.graphql';

export default function useOpenGraphPost(postId: string) {
  const queryResponse = useLazyLoadQuery<useOpenGraphPostQuery>(
    graphql`
      query useOpenGraphPostQuery($postId: DBID!) {
        post: postById(id: $postId) {
          ... on ErrPostNotFound {
            __typename
          }
          ... on Post {
            __typename
            author @required(action: THROW) {
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    ...getPreviewImageUrlsInlineDangerouslyFragment
                  }
                }
                ... on EnsProfileImage {
                  __typename
                  profileImage {
                    __typename
                    previewURLs {
                      medium
                    }
                  }
                }
              }
            }
            caption
            tokens {
              ...getPreviewImageUrlsInlineDangerouslyFragment
            }
          }
        }
      }
    `,
    { postId: postId as string }
  );

  return queryResponse.post;
}
