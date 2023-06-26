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
import { CommentNote } from '~/components/Feed/Socialize/NotesModal/CommentNote';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { NotesModalFragment$key } from '~/generated/NotesModalFragment.graphql';
import { NotesModalQueryFragment$key } from '~/generated/NotesModalQueryFragment.graphql';

import { CommentBox } from '../CommentBox/CommentBox';

export const NOTES_PER_PAGE = 10;

type NotesModalProps = {
  fullscreen: boolean;
  eventRef: NotesModalFragment$key;
  queryRef: NotesModalQueryFragment$key;
};

export function NotesModal({ eventRef, queryRef, fullscreen }: NotesModalProps) {
  const {
    data: feedEvent,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment NotesModalFragment on FeedEvent
      @refetchable(queryName: "NotesModalRefetchableFragment") {
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "NotesModal_interactions") {
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
      fragment NotesModalQueryFragment on Query {
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
    <ModalContent fullscreen={fullscreen}>
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
                  />
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </VStack>
        <CommentBox onClose={() => {}} eventRef={feedEvent} queryRef={query} />
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
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_PX}px 0px 0px;
  max-height: 420px;
`;
