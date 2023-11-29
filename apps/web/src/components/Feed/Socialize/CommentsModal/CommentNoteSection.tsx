import { useCallback, useMemo, useState } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { CommentNoteSectionFragment$key } from '~/generated/CommentNoteSectionFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import { CommentNote, OnReplyClickParams } from './CommentNote';

type Props = {
  commentRef: CommentNoteSectionFragment$key;
  activeCommentId?: string;
  onReplyClick: (params: OnReplyClickParams) => void;
  onExpand: () => void;
};

export const REPLIES_PER_PAGE = 6;

export function CommentNoteSection({ commentRef, activeCommentId, onReplyClick, onExpand }: Props) {
  const {
    data: comment,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment CommentNoteSectionFragment on Comment
      @refetchable(queryName: "CommentNoteSectionPaginationQuery") {
        __typename
        dbid
        replies(last: $replyLast, before: $replyBefore)
          @connection(key: "CommentNoteSectionPagination_replies") {
          edges {
            node {
              __typename
              dbid
              ...CommentNoteFragment
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            total
          }
        }
        ...CommentNoteFragment
      }
    `,
    commentRef
  );

  const [showReplies, setShowReplies] = useState(false);

  const replies = useMemo(() => {
    return removeNullValues(comment.replies?.edges?.map((edge) => edge?.node));
  }, [comment?.replies?.edges]);

  const totalReplies = comment?.replies?.pageInfo.total ?? 0;

  const totalRepliesShown = useMemo(() => {
    if (!showReplies) {
      return totalReplies;
    }

    return totalReplies - replies.length;
  }, [replies, showReplies, totalReplies]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(REPLIES_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const handleViewRepliesClick = useCallback(() => {
    if (!showReplies) {
      setShowReplies(true);
      onExpand();
    } else {
      loadMore();
      onExpand();
    }
  }, [loadMore, onExpand, showReplies]);

  const handleReplyClickWithTopCommentId = useCallback(
    (params: OnReplyClickParams) => {
      if (!params?.username) return;
      const payload = {
        ...params,
        topCommentId: comment.dbid,
      };
      onReplyClick(payload);
    },
    [comment.dbid, onReplyClick]
  );

  // TEMPORARY FIX: not sure how this component is even being rendered without a truthy `comment`

  if (!comment) {
    return null;
  }
  // END TEMPORARY FIX

  return (
    <VStack>
      <CommentNote
        commentRef={comment}
        onReplyClick={handleReplyClickWithTopCommentId}
        activeCommentId={activeCommentId}
        footerElement={
          !showReplies && (
            <ViewRepliesButton
              totalReplies={totalRepliesShown}
              showReplies={showReplies}
              onClick={handleViewRepliesClick}
            />
          )
        }
      />

      {showReplies && (
        <>
          {replies.map((reply) => (
            <CommentNote
              key={reply.dbid}
              commentRef={reply}
              onReplyClick={handleReplyClickWithTopCommentId}
              isReply
              activeCommentId={activeCommentId}
            />
          ))}

          <StyledViewRepliesButtonWrapper>
            <ViewRepliesButton
              totalReplies={totalRepliesShown}
              showReplies={showReplies}
              onClick={handleViewRepliesClick}
            />
          </StyledViewRepliesButtonWrapper>
        </>
      )}
    </VStack>
  );
}

type ViewRepliesButtonProps = {
  totalReplies: number;
  showReplies: boolean;
  onClick: () => void;
};
function ViewRepliesButton({ totalReplies, showReplies, onClick }: ViewRepliesButtonProps) {
  if (totalReplies < 1) {
    return null;
  }

  return (
    <HStack gap={4} align="center" onClick={onClick}>
      <StyledReplyDot />
      <StyledReplyText role="button">
        View {totalReplies} {showReplies ? 'more ' : ''}
        {totalReplies === 1 ? 'reply' : 'replies'}
      </StyledReplyText>
    </HStack>
  );
}

const StyledReplyText = styled(BaseS)`
  color: ${colors.shadow};
  font-weight: 700;
  cursor: pointer;
`;

const StyledReplyDot = styled.div`
  height: 4px;
  width: 4px;
  background-color: ${colors.shadow};
  border-radius: 50%;
`;

const StyledViewRepliesButtonWrapper = styled.div`
  padding-left: 48px;
`;
