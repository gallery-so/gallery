import { useCallback, useMemo, useState } from 'react';
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

export const NOTES_PER_PAGE = 10;

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

  const modalHeight = useMemo(() => {
    let height = 0;

    for (let i = 0; i < nonNullInteractions.length; i++) {
      height += measurerCache.getHeight(i, 0);
    }

    // 52 is the height of the modal header + bottom padding
    // 69 is the height of the comment box
    return height + 52 + 69;
  }, [measurerCache, nonNullInteractions.length]);

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
              <div style={style} ref={registerChild}>
                <CommentNote commentRef={interaction} />
              </div>
            );
          }}
        </CellMeasurer>
      );
    },
    [measurerCache, nonNullInteractions]
  );

  const isRowLoaded = ({ index }: { index: number }) =>
    !hasPrevious || index < nonNullInteractions.length;

  const rowCount = hasPrevious ? nonNullInteractions.length + 1 : nonNullInteractions.length;

  return (
    <ModalContent fullscreen={fullscreen} height={modalHeight}>
      <WrappingVStack>
        <StyledHeader>
          <TitleDiatypeM>Comments</TitleDiatypeM>
        </StyledHeader>
        <VStack grow>
          <AutoSizer>
            {({ width, height }) => (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={handleLoadMore}
                rowCount={rowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  <List
                    width={width}
                    height={height}
                    rowRenderer={rowRenderer}
                    rowCount={nonNullInteractions.length}
                    rowHeight={measurerCache.rowHeight}
                    onRowsRendered={onRowsRendered}
                    ref={registerChild}
                    style={{
                      paddingTop: '16px',
                    }}
                  />
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

const ModalContent = styled.div<{ fullscreen: boolean; height: number }>`
  height: ${({ fullscreen, height }) => (fullscreen ? '100%' : `${height}px`)};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_PX}px 0px 0px;
  max-height: 420px;
  min-height: 170px;
`;
