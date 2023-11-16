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
import { CommentNote } from '~/components/Feed/Socialize/CommentsModal/CommentNote';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { CommentsModalFragment$key } from '~/generated/CommentsModalFragment.graphql';
import { CommentsModalQueryFragment$key } from '~/generated/CommentsModalQueryFragment.graphql';
import { MentionInput } from '~/generated/useCommentOnPostMutation.graphql';
import colors from '~/shared/theme/colors';

import { CommentBox } from '../CommentBox/CommentBox';

export const NOTES_PER_PAGE = 20;

type CommentsModalProps = {
  fullscreen: boolean;
  queryRef: CommentsModalQueryFragment$key;
  hasPrevious: boolean;
  loadPrevious: (count: number) => void;
  commentsRef: CommentsModalFragment$key;
  onSubmitComment: (comment: string, mentions: MentionInput[]) => void;
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

  const virtualizedListRef = useRef<List | null>(null);

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
    }) as CellMeasurerCache & { _rowHeightCache: Record<number, number> };
  }, []);

  const handleLoadMore = useCallback(async () => {
    loadPrevious(NOTES_PER_PAGE);
  }, [loadPrevious]);

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
                <CommentNote commentRef={interaction} activeCommentId={activeCommentId} />
              </div>
            );
          }}
        </CellMeasurer>
      );
    },
    [activeCommentId, measurerCache, comments]
  );

  const [contentHeight, setContentHeight] = useState(0);

  // calculate the height of the list
  useEffect(() => {
    let height = 0;
    for (let i = 0; i < rowCount; i++) {
      height += measurerCache.rowHeight({ index: i });
    }
    const modalMaxHeight = fullscreen ? window.innerHeight : 640;
    // 121 is the height of the modal header + bottom padding + comment box
    setContentHeight(Math.min(height, modalMaxHeight - 121));
    //
    // limit dependencies. we specifically want to run this effect only when the rowHeightCache changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurerCache._rowHeightCache]);

  const isRowLoaded = ({ index }: { index: number }) => !hasPrevious || index < comments.length;

  const rowCount = hasPrevious ? comments.length + 1 : comments.length;

  useEffect(
    function recalculateHeightsWhenCommentsChange() {
      measurerCache.clearAll();
      virtualizedListRef.current?.recomputeRowHeights();
    },
    [comments, measurerCache]
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
        <CommentBox
          queryRef={query}
          onSubmitComment={onSubmitComment}
          isSubmittingComment={isSubmittingComment}
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
