import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { CommentNoteSectionFragment$key } from '~/generated/CommentNoteSectionFragment.graphql';
import { CommentNoteSectionQueryFragment$key } from '~/generated/CommentNoteSectionQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import { CommentNote, OnReplyClickParams } from './CommentNote';

type Props = {
  index: number;
  commentRef: CommentNoteSectionFragment$key;
  queryRef: CommentNoteSectionQueryFragment$key;
  activeCommentId?: string;
  onReplyClick: (params: OnReplyClickParams) => void;

  onRowRepliesExpand: (index: number, value: boolean) => void;
  onExpandModal: () => void;
};

export const REPLIES_PER_PAGE = 10;

export function CommentNoteSection({
  index,
  commentRef,
  queryRef,
  activeCommentId,
  onReplyClick,
  onRowRepliesExpand,
  onExpandModal,
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

  const query = useFragment(
    graphql`
      fragment CommentNoteSectionQueryFragment on Query {
        ...CommentNoteQueryFragment
      }
    `,
    queryRef
  );

  const replies = useMemo(() => {
    return removeNullValues(comment.replies?.edges?.map((edge) => edge?.node));
  }, [comment?.replies?.edges]);

  const totalReplies = comment?.replies?.pageInfo.total ?? 0;

  const totalRepliesShown = useMemo(() => {
    return totalReplies - replies.length;
  }, [replies, totalReplies]);

  const loadMore = useCallback(async () => {
    if (hasPrevious) {
      await new Promise((resolve) => {
        loadPrevious(REPLIES_PER_PAGE, { onComplete: resolve });
      });
      onExpandModal();
    }
  }, [hasPrevious, loadPrevious, onExpandModal]);

  const handleViewRepliesClick = useCallback(() => {
    loadMore();
    onRowRepliesExpand(index, true);
  }, [loadMore, onRowRepliesExpand, index]);

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

  return (
    <VStack>
      <CommentNote
        commentRef={comment}
        queryRef={query}
        onReplyClick={handleReplyClickWithTopCommentId}
        activeCommentId={activeCommentId}
      />

      {replies.map((reply) => (
        <CommentNote
          key={reply.dbid}
          commentRef={reply}
          onReplyClick={handleReplyClickWithTopCommentId}
          isReply
          activeCommentId={activeCommentId}
          queryRef={query}
        />
      ))}

      <StyledViewRepliesButtonWrapper>
        <ViewRepliesButton totalReplies={totalRepliesShown} onClick={handleViewRepliesClick} />
      </StyledViewRepliesButtonWrapper>
    </VStack>
  );
}

type ViewRepliesButtonProps = {
  totalReplies: number;
  onClick: () => void;
};
function ViewRepliesButton({ totalReplies, onClick }: ViewRepliesButtonProps) {
  if (totalReplies < 1) {
    return null;
  }

  return (
    <HStack gap={4} align="center" onClick={onClick}>
      <StyledReplyDot />
      <StyledReplyText role="button">
        View {totalReplies} more {''}
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
