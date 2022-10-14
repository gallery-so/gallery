import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NotesModalFragment$key } from '__generated__/NotesModalFragment.graphql';
import { MODAL_PADDING_THICC_PX } from 'contexts/modal/constants';
import styled from 'styled-components';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import colors from 'components/core/colors';
import { BaseM, BaseS, TitleS, TitleXS } from 'components/core/Text/Text';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowRenderer,
} from 'react-virtualized';
import { useCallback, useMemo, useState } from 'react';
import { getTimeSince } from 'utils/time';
import Link from 'next/link';

export const NOTES_PER_PAGE = 10;

type NotesModalProps = {
  fullscreen: boolean;
  eventRef: NotesModalFragment$key;
};

export function NotesModal({ eventRef, fullscreen }: NotesModalProps) {
  const {
    data: feedEvent,
    loadNext,
    hasNext,
  } = usePaginationFragment(
    graphql`
      fragment NotesModalFragment on FeedEvent
      @refetchable(queryName: "NotesModalRefetchableFragment") {
        dbid

        interactions(first: $interactionsFirst, after: $interactionsAfter)
          @connection(key: "NotesModal_interactions") {
          edges {
            node {
              ... on Admire {
                __typename

                creationTime
                admirer {
                  username
                }
              }
              ... on Comment {
                __typename

                comment
                creationTime

                commenter {
                  username
                }
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

    if (hasNext) {
      interactions.push({ kind: 'see-more' });
    }

    return interactions;
  }, [feedEvent.interactions?.edges, hasNext]);

  const [measurerCache] = useState(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 0,
    });
  });

  const handleSeeMore = useCallback(() => {
    loadNext(NOTES_PER_PAGE);
  }, [loadNext]);

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, parent, key, style }) => {
      const interaction = nonNullInteractionsAndSeeMore[index];

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
                <ListItem ref={registerChild} style={style}>
                  <SeeMoreContainer role="button" onClick={handleSeeMore}>
                    <TitleXS color={colors.shadow}>See More</TitleXS>
                  </SeeMoreContainer>
                </ListItem>
              );
            } else if (interaction.__typename === 'Admire') {
              const timeAgo = interaction.creationTime
                ? getTimeSince(interaction.creationTime)
                : null;

              return (
                // @ts-expect-error Bad types from react-virtualized
                <ListItem ref={registerChild} justify="space-between" style={style} gap={4}>
                  <HStack gap={4}>
                    <UsernameLink username={interaction.admirer?.username ?? null} />
                    <BaseM>admired this</BaseM>
                  </HStack>

                  <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
                </ListItem>
              );
            } else if (interaction.__typename === 'Comment') {
              const timeAgo = interaction.creationTime
                ? getTimeSince(interaction.creationTime)
                : null;

              return (
                // @ts-expect-error Bad types from react-virtualized
                <ListItem ref={registerChild} justify="space-between" style={style} gap={4}>
                  <HStack gap={4}>
                    <UsernameLink username={interaction.commenter?.username ?? null} />
                    <BaseM>{interaction.comment}</BaseM>
                  </HStack>

                  <TimeAgoText color={colors.metal}>{timeAgo}</TimeAgoText>
                </ListItem>
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

type UsernameLinkProps = { username: string | null };

function UsernameLink({ username }: UsernameLinkProps) {
  const link = username ? `/${username}` : '';
  return (
    <Link href={link}>
      <UsernameLinkWrapper href={link}>
        <TitleS>{username ?? '<unknown>'}</TitleS>
      </UsernameLinkWrapper>
    </Link>
  );
}

const UsernameLinkWrapper = styled.a`
  color: ${colors.offBlack};
  text-decoration: none;
`;

const SeeMoreContainer = styled.div`
  cursor: pointer;
`;

const TimeAgoText = styled(BaseS)`
  white-space: nowrap;
  flex-shrink: 0;
`;

const WrappingVStack = styled(VStack)`
  height: 100%;
`;

const StyledHeader = styled.div`
  padding-bottom: ${MODAL_PADDING_THICC_PX}px;
  padding-left: 12px;
`;

const ListItem = styled(HStack)`
  padding: 8px 12px;
`;

const ModalContent = styled.div<{ fullscreen: boolean }>`
  height: ${({ fullscreen }) => (fullscreen ? '100%' : '640px')};
  width: ${({ fullscreen }) => (fullscreen ? '100%' : '540px')};
  display: flex;
  flex-direction: column;
  padding: ${MODAL_PADDING_THICC_PX}px 8px;
`;
