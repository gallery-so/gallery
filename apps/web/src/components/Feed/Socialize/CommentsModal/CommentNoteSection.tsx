import { useCallback, useMemo } from 'react';
import { graphql, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { CommentNoteSectionFragment$key } from '~/generated/CommentNoteSectionFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import { CommentNote, OnReplyClickParams } from './CommentNote';

type Props = {
  index: number;
  commentRef: CommentNoteSectionFragment$key;
  activeCommentId?: string;
  onReplyClick: (params: OnReplyClickParams) => void;
  onExpand: (index: number) => void;

  onRowRepliesExpand: (index: number, value: boolean) => void;
  isRowRepliesExpanded: boolean;
};

// export const REPLIES_PER_PAGE = 6;
export const REPLIES_PER_PAGE = 1;

export function CommentNoteSection({
  index,
  commentRef,
  activeCommentId,
  onReplyClick,
  onExpand,
  onRowRepliesExpand,
  isRowRepliesExpanded,
}: Props) {
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

  const replies = useMemo(() => {
    return removeNullValues(comment.replies?.edges?.map((edge) => edge?.node));
  }, [comment?.replies?.edges]);

  const totalReplies = comment?.replies?.pageInfo.total ?? 0;

  const totalRepliesShown = useMemo(() => {
    if (!isRowRepliesExpanded) {
      return totalReplies;
    }

    return totalReplies - replies.length;
  }, [replies, isRowRepliesExpanded, totalReplies]);

  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(REPLIES_PER_PAGE);
      onExpand(index);
    }
  }, [hasPrevious, loadPrevious, onExpand, index]);

  const handleViewRepliesClick = useCallback(() => {
    if (!isRowRepliesExpanded) {
      onRowRepliesExpand(index, true);
      onExpand(index);
    } else {
      loadMore();
      onExpand(index);
    }
  }, [loadMore, onExpand, isRowRepliesExpanded, onRowRepliesExpand, index]);

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
          !isRowRepliesExpanded && (
            <ViewRepliesButton
              totalReplies={totalRepliesShown}
              showReplies={isRowRepliesExpanded}
              onClick={handleViewRepliesClick}
            />
          )
        }
      />

      {isRowRepliesExpanded && (
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
              showReplies={isRowRepliesExpanded}
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
