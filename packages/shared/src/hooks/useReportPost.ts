import { useCallback } from 'react';
import { graphql } from 'relay-runtime';

import { ReportReason, useReportPostMutation } from '~/generated/useReportPostMutation.graphql';

import { usePromisifiedMutation } from '../relay/usePromisifiedMutation';

export function useReportPost() {
  const [reportPost] = usePromisifiedMutation<useReportPostMutation>(
    graphql`
      mutation useReportPostMutation($postId: DBID!, $reason: ReportReason!) {
        reportPost(postId: $postId, reason: $reason) {
          __typename
          ... on ReportPostPayload {
            postId
          }
        }
      }
    `
  );

  return useCallback(
    async (postId: string, reason: ReportReason) => {
      const { reportPost: response } = await reportPost({
        variables: {
          postId,
          reason,
        },
      });

      if (response?.__typename === 'ReportPostPayload') {
        return response.postId;
      }

      throw new Error('Failed to report post');
    },
    [reportPost]
  );
}
