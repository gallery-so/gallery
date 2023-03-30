import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useMemo, useRef } from 'react';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM, TitleXS } from '~/components/core/Text/Text';
import { AdmireNote } from '~/components/Feed/Socialize/NotesModal/AdmireNote';
import { CommentNote } from '~/components/Feed/Socialize/NotesModal/CommentNote';
import { ListItem } from '~/components/Feed/Socialize/NotesModal/ListItem';
import VirtualizedContainer from '~/components/Virtualize/VirtualizeContainer';
import { MODAL_PADDING_PX } from '~/contexts/modal/constants';
import { NotesModalFragment$key } from '~/generated/NotesModalFragment.graphql';

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
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "NotesModal_interactions") {
          edges {
            node {
              __typename

              ... on Admire {
                ...AdmireNoteFragment
              }
              ... on Comment {
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

    interactions.reverse();

    if (hasPrevious) {
      interactions.unshift({ kind: 'see-more' });
    }

    return interactions;
  }, [feedEvent.interactions?.edges, hasPrevious]);

  // sort interactions by comment and admire
  const sortedInteractions = useMemo(() => {
    return nonNullInteractionsAndSeeMore.sort((a, b) => {
      if ('kind' in a || 'kind' in b) {
        return 0;
      }

      if (a.__typename === 'Comment' && b.__typename === 'Admire') {
        return 1;
      }

      if (a.__typename === 'Admire' && b.__typename === 'Comment') {
        return -1;
      }

      return 0;
    });
  }, [nonNullInteractionsAndSeeMore]);

  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: sortedInteractions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleSeeMore = useCallback(() => {
    loadPrevious(NOTES_PER_PAGE);
  }, [loadPrevious]);

  return (
    <ModalContent fullscreen={fullscreen}>
      <WrappingVStack>
        <StyledHeader>
          <TitleDiatypeM>Notes</TitleDiatypeM>
        </StyledHeader>
        <NotesContainer grow ref={parentRef}>
          <VirtualizedContainer virtualizer={virtualizer}>
            {virtualItems.map((item) => {
              const interaction = sortedInteractions[sortedInteractions.length - item.index - 1];

              if (!interaction) {
                return null;
              }
              if ('kind' in interaction) {
                return (
                  <div data-index={item.index} ref={virtualizer.measureElement} key={item.key}>
                    <ListItem>
                      <SeeMoreContainer role="button" onClick={handleSeeMore}>
                        <TitleXS color={colors.shadow}>See More</TitleXS>
                      </SeeMoreContainer>
                    </ListItem>
                  </div>
                );
              } else if (interaction.__typename === 'Admire') {
                return (
                  <div data-index={item.index} ref={virtualizer.measureElement} key={item.key}>
                    <AdmireNote admireRef={interaction} />
                  </div>
                );
              } else if (interaction.__typename === 'Comment') {
                return (
                  <div data-index={item.index} ref={virtualizer.measureElement} key={item.key}>
                    <CommentNote commentRef={interaction} />
                  </div>
                );
              } else {
                return null;
              }
            })}
          </VirtualizedContainer>
        </NotesContainer>
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
  padding-bottom: ${MODAL_PADDING_PX}px;
  padding-left: 12px;
`;

const ModalContent = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_PX}px 8px;
`;

const NotesContainer = styled(VStack)`
  position: relative;
`;
