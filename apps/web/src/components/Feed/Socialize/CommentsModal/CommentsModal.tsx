import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFragment, usePaginationFragment } from 'react-relay';
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
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { CommentNote } from '~/components/Feed/Socialize/CommentsModal/CommentNote';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { CommentsModalFragment$key } from '~/generated/CommentsModalFragment.graphql';
import { CommentsModalQueryFragment$key } from '~/generated/CommentsModalQueryFragment.graphql';

import { CommentBox } from '../CommentBox/CommentBox';

export const NOTES_PER_PAGE = 20;

type CommentsModalProps = {
  fullscreen: boolean;
  eventRef: CommentsModalFragment$key;
  queryRef: CommentsModalQueryFragment$key;
};

export function CommentsModal({ eventRef, queryRef, fullscreen }: CommentsModalProps) {
  const {
    data: feedEvent,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment CommentsModalFragment on FeedEvent
      @refetchable(queryName: "CommentsModalRefetchableFragment") {
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "CommentsModal_interactions") {
          edges {
            node {
              __typename

              ... on Comment {
                comment
                ...CommentNoteFragment
              }
            }
          }
        }
        ...CommentBoxFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment CommentsModalQueryFragment on Query {
        ...CommentBoxQueryFragment
        ...CommentNoteQueryFragment
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

  const [measurerCache] = useState(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 0,
    });
  });

  const virtualizedListRef = useRef<List | null>(null);
  const handleLoadMore = useCallback(async () => {
    loadPrevious(NOTES_PER_PAGE);
  }, [loadPrevious]);

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, parent, key, style }) => {
      const interaction = nonNullInteractions[nonNullInteractions.length - index - 1];

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
                <CommentNote commentRef={interaction} queryRef={query} />
              </div>
            );
          }}
        </CellMeasurer>
      );
    },
    [measurerCache, nonNullInteractions, query]
  );

  const isRowLoaded = ({ index }: { index: number }) =>
    !hasPrevious || index < nonNullInteractions.length;

  const rowCount = hasPrevious ? nonNullInteractions.length + 1 : nonNullInteractions.length;

  const estimatedContentHeight = useMemo(() => {
    // 420 is the max height of the modal
    // 121 is the height of the modal header + bottom padding + comment box

    let height = 0;

    nonNullInteractions.forEach((interaction) => {
      if (interaction.__typename === 'Comment') {
        // If the comment more than 70 characters, we need to add extra height
        // to account for the extra line
        const commentLength = interaction.comment?.length ?? 0;

        if (commentLength > 70) {
          height += 70;
          return;
        }

        height += 50;
      }
    });

    return Math.min(height, 420 - 121);
  }, [nonNullInteractions]);

  useEffect(
    function recalculateHeightsWhenEventsChange() {
      measurerCache.clearAll();
      virtualizedListRef.current?.recomputeRowHeights();
    },
    [nonNullInteractions, measurerCache]
  );

  return (
    <ModalContent fullscreen={fullscreen}>
      <WrappingVStack>
        <StyledHeader>
          <TitleDiatypeM>Comments</TitleDiatypeM>
        </StyledHeader>
        <VStack grow>
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
                      width={width}
                      height={estimatedContentHeight}
                      rowRenderer={rowRenderer}
                      rowCount={nonNullInteractions.length}
                      rowHeight={measurerCache.rowHeight}
                      onRowsRendered={onRowsRendered}
                      ref={virtualizedListRef}
                      style={{
                        paddingTop: '16px',
                      }}
                    />
                  </div>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </VStack>
        <CommentBox eventRef={feedEvent} queryRef={query} />
      </WrappingVStack>
    </ModalContent>
  );
}

const WrappingVStack = styled(VStack)`
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
  min-height: 170px;
  height: 100%;
`;
