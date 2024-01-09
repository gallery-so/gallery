import { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { CommentLine } from '~/components/Feed/Socialize/CommentLine';
import { RemainingCommentCount } from '~/components/Feed/Socialize/RemainingCommentCount';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CommentsFragment$key } from '~/generated/CommentsFragment.graphql';
import { CommentsQueryFragment$key } from '~/generated/CommentsQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { FeedEventsCommentsModal } from './CommentsModal/FeedEventsCommentsModal';
import PostCommentsModal from './CommentsModal/PostCommentsModal';

type Props = {
  onPotentialLayoutShift?: () => void;
  eventRef: CommentsFragment$key;
  queryRef: CommentsQueryFragment$key;
};

export function Comments({ eventRef, queryRef, onPotentialLayoutShift }: Props) {
  const feedItem = useFragment(
    graphql`
      fragment CommentsFragment on FeedEventOrError {
        __typename
        # We only show 2 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        ... on FeedEvent {
          comments(last: 5) @connection(key: "Interactions_comments") {
            edges {
              node {
                dbid
                deleted
                ...CommentLineFragment
              }
            }
          }

          ...RemainingCommentCountFragment
          totalComments
        }

        ... on Post {
          comments(last: 5) @connection(key: "Interactions_comments") {
            edges {
              node {
                dbid
                deleted
                ...CommentLineFragment
              }
            }
          }
          totalComments
          ...RemainingCommentCountFragment
        }

        ...FeedEventsCommentsModalFragment
        ...PostCommentsModalFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment CommentsQueryFragment on Query {
        ...RemainingCommentCountQueryFragment
        ...FeedEventsCommentsModalQueryFragment
        ...PostCommentsModalQueryFragment
      }
    `,
    queryRef
  );

  const track = useTrack();
  const router = useRouter();
  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const commentId = router.query.commentId as string;

  const ModalContent = useMemo(() => {
    if (feedItem.__typename === 'FeedEvent') {
      return <FeedEventsCommentsModal fullscreen={isMobile} eventRef={feedItem} queryRef={query} />;
    }

    return (
      <PostCommentsModal
        fullscreen={isMobile}
        postRef={feedItem}
        queryRef={query}
        activeCommentId={commentId}
      />
    );
  }, [feedItem, isMobile, query, commentId]);

  const handleAddCommentClick = useCallback(() => {
    track('Button Click', {
      id: 'Open Comments Modal Button',
      name: 'Open Comments Modal',
      context: contexts.Posts,
    });

    showModal({
      content: ModalContent,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'standard',
    });
  }, [ModalContent, isMobile, showModal, track]);

  const nonNullComments = useMemo(() => {
    const comments = [];

    for (const edge of feedItem.comments?.edges ?? []) {
      if (edge?.node) {
        comments.push(edge.node);
      }
    }

    return comments;
  }, [feedItem.comments?.edges]);

  const lastComment = useMemo(() => {
    const nonDeletedComments = nonNullComments.filter((comment) => !comment.deleted);
    return nonDeletedComments.slice(-1);
  }, [nonNullComments]);

  const totalComments = feedItem.totalComments ?? 0;

  const isFirstMount = useRef(true);
  useLayoutEffect(() => {
    if (!onPotentialLayoutShift) {
      return;
    }
    if (!isFirstMount.current) {
      onPotentialLayoutShift();
    }

    isFirstMount.current = false;

    // These are all the things that might cause the layout to shift
  }, [onPotentialLayoutShift, nonNullComments, totalComments]);

  /**
   * The below logic is a bit annoying to read so I'll try to explain it here
   *
   * If there are any comments, we'll show the following
   * - Comment 1
   * - X Others => Link to NotesModal
   *
   * If there are no comments, but there are any admires, we'll show the following
   *    If there's only 1 admires
   *      Show "Person admired this"
   *    If there's > 1 admire
   *      Show "X admired this" => Link to NotesModal
   *
   * Extra:
   * There's a bit of extra logic you can see where we're checking the `PageInfo.total`
   * as well as checking the actual length of the admires / comments array.
   *
   * This is because there is a possibility that the user will either delete a comment
   * or delete an admire. Under this case, the total count of comments / admires might
   * be some large number, but we only actually have 0, 1, or 2 in the list
   *
   * Imagine this:
   * 1. We load the page, and we hypothetically fetch 5 comments posted by the logged in user
   * 2. There's actually a total of 10 comments on the server, but we only fetched 5
   * 3. The user then goes and deletes all 5 of those comments
   *
   * Now we're in a state where `totalComments` is 5, but we don't actually have any comments
   * to show, so we'll have to fallback to some other UI here. In this case, we'll just show
   * the total number of comments / admires that links to the NotesModal
   */
  if (totalComments > 0 && lastComment.length > 0) {
    if (lastComment.length > 0) {
      return (
        <VStack gap={4}>
          <VStack>
            {lastComment.map((comment) => {
              return (
                <StyledCommentContainer key={comment.dbid} onClick={handleAddCommentClick}>
                  <CommentLine commentRef={comment} />
                </StyledCommentContainer>
              );
            })}
          </VStack>

          <RemainingCommentCount
            eventRef={feedItem}
            totalComments={totalComments}
            queryRef={query}
          />
        </VStack>
      );
    }

    return (
      <RemainingCommentCount eventRef={feedItem} totalComments={totalComments} queryRef={query} />
    );
  }

  return router.route === '/community/[chain]/[contractAddress]/live' ? (
    <StyledAddCommentCta color={colors.shadow}>
      Join the coversation in the Gallery app
    </StyledAddCommentCta>
  ) : (
    <StyledAddCommentCta onClick={handleAddCommentClick} color={colors.shadow}>
      Add a comment
    </StyledAddCommentCta>
  );
}

const StyledAddCommentCta = styled(TitleDiatypeM)`
  cursor: pointer;
`;

const StyledCommentContainer = styled.div`
  cursor: pointer;
`;
