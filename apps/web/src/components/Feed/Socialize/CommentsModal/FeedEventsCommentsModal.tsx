import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { FeedEventsCommentsModalFragment$key } from '~/generated/FeedEventsCommentsModalFragment.graphql';
import { FeedEventsCommentsModalQueryFragment$key } from '~/generated/FeedEventsCommentsModalQueryFragment.graphql';
import useCommentOnFeedEvent from '~/hooks/api/feedEvents/useCommentOnFeedEvent';
import useOptimisticUserInfo from '~/utils/useOptimisticUserInfo';

import { OnReplyClickParams } from './CommentNote';
import { CommentsModal } from './CommentsModal';

type Props = {
  eventRef: FeedEventsCommentsModalFragment$key;
  queryRef: FeedEventsCommentsModalQueryFragment$key;
  fullscreen: boolean;
  replyToComment?: OnReplyClickParams;
};

export function FeedEventsCommentsModal({ eventRef, queryRef, fullscreen, replyToComment }: Props) {
  const {
    data: feedEvent,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment FeedEventsCommentsModalFragment on FeedEvent
      @refetchable(queryName: "FeedEventsCommentsModalRefetchableFragment") {
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "CommentsModal_interactions") {
          edges {
            node {
              __typename

              ... on Comment {
                ...CommentsModalFragment
              }
            }
          }
        }
        id
        dbid
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventsCommentsModalQueryFragment on Query {
        ...useOptimisticUserInfoFragment
        ...CommentsModalQueryFragment
      }
    `,
    queryRef
  );

  const nonNullInteractions = useMemo(() => {
    const interactions = [];

    for (const interaction of feedEvent.interactions?.edges ?? []) {
      if (interaction?.node && interaction.node.__typename === 'Comment') {
        interactions.push(interaction.node);
      }
    }

    return interactions.reverse();
  }, [feedEvent.interactions?.edges]);

  const [commentOnFeedEvent, isSubmittingComment] = useCommentOnFeedEvent();

  const info = useOptimisticUserInfo(query);

  const handleSubmitComment = useCallback(
    (comment: string) => {
      commentOnFeedEvent(feedEvent.id, feedEvent.dbid, comment, info);
    },
    [commentOnFeedEvent, feedEvent.dbid, feedEvent.id, info]
  );

  return (
    <CommentsModal
      commentsRef={nonNullInteractions}
      queryRef={query}
      fullscreen={fullscreen}
      hasPrevious={hasPrevious}
      loadPrevious={loadPrevious}
      onSubmitComment={handleSubmitComment}
      isSubmittingComment={isSubmittingComment}
      replyToComment={replyToComment}
    />
  );
}
