import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFragment } from 'react-relay';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  ListRowRenderer,
} from 'react-virtualized';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { CommentsModalFragment$key } from '~/generated/CommentsModalFragment.graphql';
import { CommentsModalQueryFragment$key } from '~/generated/CommentsModalQueryFragment.graphql';
import { MentionInput } from '~/generated/useCommentOnPostMutation.graphql';
import colors from '~/shared/theme/colors';

import { CommentBox } from '../CommentBox/CommentBox';
import { OnReplyClickParams } from './CommentNote';
import { CommentNoteSection } from './CommentNoteSection';
import { CommentRepliedBanner } from './CommentRepliedBanner';

export const NOTES_PER_PAGE = 20;

type CommentsModalProps = {
  fullscreen: boolean;
  queryRef: CommentsModalQueryFragment$key;
  hasPrevious: boolean;
  loadPrevious: (count: number) => void;
  commentsRef: CommentsModalFragment$key;
  onSubmitComment: (
    comment: string,
    mentions: MentionInput[],
    replyToId?: string,
    topCommentId?: string
  ) => void;
  isSubmittingComment: boolean;
  activeCommentId?: string;
};

export function CommentsModal({
  activeCommentId,
  commentsRef,
  queryRef,
  fullscreen,
  hasPrevious,
  loadPrevious,
  onSubmitComment,
  isSubmittingComment,
}: CommentsModalProps) {
  const comments = useFragment(
    graphql`
      fragment CommentsModalFragment on Comment @relay(plural: true) {
        dbid
        ...CommentNoteFragment
        ...CommentNoteSectionFragment
      }
    `,
    commentsRef
  );

  const query = useFragment(
    graphql`
      fragment CommentsModalQueryFragment on Query {
        ...CommentBoxQueryFragment
      }
    `,
    queryRef
  );

  const [selectedComment, setSelectedComment] = useState<OnReplyClickParams>(null);
  const topCommentId = useRef<string | null>(null);
  const virtualizedListRef = useRef<List | null>(null);

  const highlightCommentId = useMemo(() => {
    if (selectedComment?.commentId) {
      return selectedComment.commentId;
    }

    if (activeCommentId) {
      return activeCommentId;
    }

    return undefined;
  }, [activeCommentId, selectedComment?.commentId]);

  const handleReplyClick = useCallback((params: OnReplyClickParams) => {
    setSelectedComment(params);

    if (params?.topCommentId) {
      topCommentId.current = params.topCommentId;
    } else {
      topCommentId.current = null;
    }

    // commentBoxRef.current?.focus();
  }, []);

  const handleSubmitComment = useCallback(
    (comment: string, mentions: MentionInput[]) => {
      onSubmitComment(comment, mentions, selectedComment?.commentId, topCommentId?.current ?? '');
      setSelectedComment(null);
      topCommentId.current = null;
    },
    [onSubmitComment, selectedComment?.commentId]
  );

  const commentRowIndex = useMemo(() => {
    if (!activeCommentId) {
      return null;
    }

    const index = comments.findIndex((comment) => comment.dbid === activeCommentId);

    if (index === -1) {
      return null;
    }

    return comments.length - index - 1;
  }, [activeCommentId, comments]);

  useEffect(() => {
    if (commentRowIndex !== null && virtualizedListRef.current) {
      virtualizedListRef.current.scrollToRow(commentRowIndex);
    }
  }, [commentRowIndex]);

  const measurerCache = useMemo(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 0,
      // _rowHeightCache is a private property of CellMeasurerCache but we need to use it seems to be the only way to
      // trigger an effect when the row heights change. measurerCache itself doesnt trigger an effect.
    }) as CellMeasurerCache & { _rowHeightCache: Record<number, number> };
  }, []);

  const handleLoadMore = useCallback(async () => {
    loadPrevious(NOTES_PER_PAGE);
  }, [loadPrevious]);

  const rowRepliesExpanded = useState<Record<number, boolean>>({});

  const setRowRepliesExpanded = useCallback(
    (index: number, value: boolean) => {
      rowRepliesExpanded[1]((prev) => {
        return {
          ...prev,
          [index]: value,
        };
      });
    },
    [rowRepliesExpanded]
  );

  const getRowRepliesExpanded = useCallback(
    (index: number) => {
      return rowRepliesExpanded[0][index] ?? false;
    },
    [rowRepliesExpanded]
  );

  const [contentHeight, setContentHeight] = useState(0);

  const isRowLoaded = ({ index }: { index: number }) => !hasPrevious || index < comments.length;

  const rowCount = hasPrevious ? comments.length + 1 : comments.length;

  const calculateModalMaxHeight = useCallback(() => {
    let height = 0;
    for (let i = 0; i < rowCount; i++) {
      height += measurerCache.rowHeight({ index: i });
    }
    const modalMaxHeight = fullscreen ? window.innerHeight : 640;
    // 121 is the height of the modal header + bottom padding + comment box
    setContentHeight(Math.min(height, modalMaxHeight - 121));
  }, [fullscreen, rowCount, measurerCache, setContentHeight]);

  const recalculateHeightsWhenCommentsChange = useCallback(() => {
    measurerCache.clearAll();
    virtualizedListRef.current?.recomputeRowHeights();
    calculateModalMaxHeight();
  }, [calculateModalMaxHeight, measurerCache]);

  useEffect(recalculateHeightsWhenCommentsChange, [
    comments,
    measurerCache,
    recalculateHeightsWhenCommentsChange,
  ]);

  // calculate the height of the list
  useEffect(() => {
    calculateModalMaxHeight();
    //
    // limit dependencies. we specifically want to run this effect only when the rowHeightCache changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurerCache._rowHeightCache]);

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, parent, key, style }) => {
      const interaction = comments[comments.length - index - 1];

      if (!interaction) {
        return null;
      }

      return (
        <CellMeasurer
          cache={measurerCache}
          columnIndex={0}
          rowIndex={index}
          key={key}
          parent={parent}
        >
          {({ registerChild }) => {
            return (
              // @ts-expect-error Bad types from react-virtualized
              <div style={style} ref={registerChild} key={key}>
                <CommentNoteSection
                  index={index}
                  commentRef={interaction}
                  activeCommentId={highlightCommentId}
                  onReplyClick={handleReplyClick}
                  onRowRepliesExpand={setRowRepliesExpanded}
                  isRowRepliesExpanded={getRowRepliesExpanded(index)}
                  onReplySubmitted={recalculateHeightsWhenCommentsChange}
                />
              </div>
            );
          }}
        </CellMeasurer>
      );
    },
    [
      getRowRepliesExpanded,
      highlightCommentId,
      measurerCache,
      comments,
      handleReplyClick,
      recalculateHeightsWhenCommentsChange,
      setRowRepliesExpanded,
    ]
  );

  return (
    <ModalContent fullscreen={fullscreen}>
      <WrappingVStack>
        <StyledHeader>
          <TitleDiatypeM>Comments</TitleDiatypeM>
        </StyledHeader>
        {rowCount === 0 ? (
          <EmptyStateVStack align="center" justify="center">
            <BaseM color={colors.metal}>No comments yet</BaseM>
          </EmptyStateVStack>
        ) : (
          <AutoSizer disableHeight>
            {({ width }) => (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={handleLoadMore}
                rowCount={rowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  <div ref={(el) => registerChild(el)}>
                    <List
                      ref={virtualizedListRef}
                      width={width}
                      height={contentHeight}
                      rowRenderer={rowRenderer}
                      rowCount={comments.length}
                      rowHeight={measurerCache.rowHeight}
                      onRowsRendered={onRowsRendered}
                    />
                  </div>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        )}
        <CommentRepliedBanner
          username={selectedComment?.username ?? ''}
          comment={selectedComment?.comment ?? ''}
          onClose={() => {
            setSelectedComment(null);
            topCommentId.current = null;
          }}
        />
        <CommentBox
          queryRef={query}
          onSubmitComment={handleSubmitComment}
          isSubmittingComment={isSubmittingComment}
          replyToId={selectedComment?.commentId}
        />
      </WrappingVStack>
    </ModalContent>
  );
}

const WrappingVStack = styled(VStack)`
  height: 100%;
`;

const EmptyStateVStack = styled(VStack)`
  padding-top: 20px;
  padding-bottom: 36px;
  height: 100%;
`;

const StyledHeader = styled.div`
  padding-bottom: ${MODAL_PADDING_PX}px;
  padding-left: ${MODAL_PADDING_PX}px;
`;

const ModalContent = styled.div<{ fullscreen: boolean }>`
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_PX}px 0px 0px;
  min-height: 240px;
  height: 100%;
`;
