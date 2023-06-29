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
import { AdmireNote } from '~/components/Feed/Socialize/AdmireModal/AdmireNote';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { AdmireModalFragment$key } from '~/generated/AdmireModalFragment.graphql';
import { AdmireModalQueryFragment$key } from '~/generated/AdmireModalQueryFragment.graphql';

export const NOTES_PER_PAGE = 10;

type NotesModalProps = {
  fullscreen: boolean;
  eventRef: AdmireModalFragment$key;
  queryRef: AdmireModalQueryFragment$key;
};

export function AdmireModal({ eventRef, queryRef, fullscreen }: NotesModalProps) {
  const {
    data: feedEvent,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment AdmireModalFragment on FeedEvent
      @refetchable(queryName: "AdmireModalRefetchableFragment") {
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "AdmiresModal_interactions") {
          edges {
            node {
              __typename

              ... on Admire {
                ...AdmireNoteFragment
              }
            }
          }
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment AdmireModalQueryFragment on Query {
        ...AdmireNoteQueryFragment
      }
    `,
    queryRef
  );

  const nonNullInteractions = useMemo(() => {
    const interactions = [];

    for (const interaction of feedEvent.interactions?.edges ?? []) {
      if (interaction?.node && interaction.node.__typename === 'Admire') {
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

    // 68 is the height of the modal header + bottom padding
    return height + 68;
  }, [measurerCache, nonNullInteractions.length]);

  const isRowLoaded = ({ index }: { index: number }) =>
    !hasPrevious || index < nonNullInteractions.length;

  const rowCount = hasPrevious ? nonNullInteractions.length + 1 : nonNullInteractions.length;

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
                <AdmireNote admireRef={interaction} queryRef={query} />
              </div>
            );
          }}
        </CellMeasurer>
      );
    },
    [measurerCache, query, nonNullInteractions]
  );

  return (
    <ModalContent fullscreen={fullscreen} height={modalHeight}>
      <WrappingVStack>
        <StyledHeader>
          <TitleDiatypeM>Admires</TitleDiatypeM>
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
