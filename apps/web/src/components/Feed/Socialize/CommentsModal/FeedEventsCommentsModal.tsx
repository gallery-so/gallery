import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { FeedEventsCommentsModalFragment$key } from '~/generated/FeedEventsCommentsModalFragment.graphql';
import { FeedEventsCommentsModalQueryFragment$key } from '~/generated/FeedEventsCommentsModalQueryFragment.graphql';
import useCommentOnFeedEvent from '~/hooks/api/feedEvents/useCommentOnFeedEvent';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { CommentsModal } from './CommentsModal';

type Props = {
  eventRef: FeedEventsCommentsModalFragment$key;
  queryRef: FeedEventsCommentsModalQueryFragment$key;
  fullscreen: boolean;
};

export function FeedEventsCommentsModal({ eventRef, queryRef, fullscreen }: Props) {
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
        viewer {
          ... on Viewer {
            user {
              id
              dbid
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    dbid
                    id
                    ...getVideoOrImageUrlForNftPreviewFragment
                  }
                }
              }
            }
          }
        }
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

  // handles specifically commenting on a feedevent
  const handleSubmitComment = useCallback(
    (comment: string) => {
      const { token } = query.viewer?.user?.profileImage ?? {};
      const user = query.viewer?.user;
      if (!user) {
        return;
      }

      const result = token
        ? getVideoOrImageUrlForNftPreview({
            tokenRef: token,
          })
        : null;
      commentOnFeedEvent(feedEvent.id, feedEvent.dbid, comment, {
        commenterUserId: user.id,
        commenterUserDbid: user.dbid,
        commenterUsername: user.username ?? '',
        commenterProfileImageUrl: result?.urls?.small ?? '',
      });
    },
    [commentOnFeedEvent, feedEvent.dbid, feedEvent.id, query.viewer?.user]
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
    />
  );
}
