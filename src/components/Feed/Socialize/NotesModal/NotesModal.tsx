import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NotesModalFragment$key } from '__generated__/NotesModalFragment.graphql';
import { MODAL_PADDING_THICC_PX } from 'contexts/modal/constants';
import styled from 'styled-components';
import { VStack } from 'components/core/Spacer/Stack';
import colors from 'components/core/colors';
import { TitleXS } from 'components/core/Text/Text';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowRenderer,
} from 'react-virtualized';
import { useCallback, useMemo, useState } from 'react';
import { AdmireNote } from 'components/Feed/Socialize/NotesModal/AdmireNote';
import { CommentNote } from 'components/Feed/Socialize/NotesModal/CommentNote';
import { ListItem } from 'components/Feed/Socialize/NotesModal/ListItem';

export const NOTES_PER_PAGE = 10;

type NotesModalProps = {
  fullscreen: boolean;
  eventRef: NotesModalFragment$key;
};

export function NotesModal({ eventRef, fullscreen }: NotesModalProps) {
  const {
    data: feedEvent,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment NotesModalFragment on FeedEvent
      @refetchable(queryName: "NotesModalRefetchableFragment") {
        dbid

        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "NotesModal_interactions") {
          edges {
            node {
              __typename

              ... on Admire {
                creationTime
                ...AdmireNoteFragment
              }
              ... on Comment {
                creationTime
                ...CommentNoteFragment
              }
            }
          }
        }
      }
    `,
    eventRef
  );

  const nonNullInteractionsAndSeeMore = useMemo(() => {
    const interactions = [];

    for (const interaction of feedEvent.interactions?.edges ?? []) {
      if (interaction?.node) {
        interactions.push(interaction.node);
      }
    }

    if (hasPrevious) {
      interactions.unshift({ kind: 'see-more' });
    }

    return interactions;
  }, [feedEvent.interactions?.edges, hasPrevious]);

  const [measurerCache] = useState(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 0,
    });
  });

  const handleSeeMore = useCallback(() => {
    loadPrevious(NOTES_PER_PAGE);
  }, [loadPrevious]);

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, parent, key, style }) => {
      const interaction =
        nonNullInteractionsAndSeeMore[nonNullInteractionsAndSeeMore.length - index - 1];

      return (
        <CellMeasurer
          cache={measurerCache}
          columnIndex={0}
          rowIndex={index}
          key={key}
          parent={parent}
        >
          {({ registerChild }) => {
            if ('kind' in interaction) {
              return (
                // @ts-expect-error Bad types from react-virtualized
                <div style={style} ref={registerChild}>
                  <ListItem>
                    <SeeMoreContainer role="button" onClick={handleSeeMore}>
                      <TitleXS color={colors.shadow}>See More</TitleXS>
                    </SeeMoreContainer>
                  </ListItem>
                </div>
              );
            } else if (interaction.__typename === 'Admire') {
              return (
                // @ts-expect-error Bad types from react-virtualized
                <div style={style} ref={registerChild}>
                  <AdmireNote admireRef={interaction} />
                </div>
              );
            } else if (interaction.__typename === 'Comment') {
              return (
                // @ts-expect-error Bad types from react-virtualized
                <div style={style} ref={registerChild}>
                  <CommentNote commentRef={interaction} />
                </div>
              );
            } else {
              return null;
            }
          }}
        </CellMeasurer>
      );
    },
    [handleSeeMore, measurerCache, nonNullInteractionsAndSeeMore]
  );

  return (
    <ModalContent fullscreen={fullscreen}>
      <WrappingVStack>
        <StyledHeader>
          <TitleXS>NOTES</TitleXS>
        </StyledHeader>
        <VStack grow>
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                rowRenderer={rowRenderer}
                rowCount={nonNullInteractionsAndSeeMore.length}
                rowHeight={measurerCache.rowHeight}
              />
            )}
          </AutoSizer>
        </VStack>
      </WrappingVStack>
    </ModalContent>
  );
}

const SeeMoreContainer = styled.div`
  cursor: pointer;
`;

const WrappingVStack = styled(VStack)`
  height: 100%;
`;

const StyledHeader = styled.div`
  padding-bottom: ${MODAL_PADDING_THICC_PX}px;
  padding-left: 12px;
`;

const ModalContent = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_THICC_PX}px 8px;
`;
