import { useFragment } from 'react-relay';
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

type NotesModalProps = {
  fullscreen: boolean;
  eventRef: NotesModalFragment$key;
};

export function NotesModal({ eventRef, fullscreen }: NotesModalProps) {
  const feedEvent = useFragment(
    graphql`
      fragment NotesModalFragment on FeedEvent {
        dbid

        admiresAndComments {
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

  const nonNullAdmiresAndComments = useMemo(() => {
    const admiresAndComments = [];

    for (const admireOrComment of feedEvent.admiresAndComments?.edges ?? []) {
      if (admireOrComment?.node) {
        admiresAndComments.push(admireOrComment.node);
      }
    }

    return admiresAndComments;
  }, [feedEvent.admiresAndComments?.edges]);

  console.log(nonNullAdmiresAndComments);

  const [measurerCache] = useState(() => {
    return new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 0,
    });
  });

  const rowRenderer = useCallback<ListRowRenderer>(
    ({ index, parent, key, style }) => {
      const admireOrComment = nonNullAdmiresAndComments[index];

      return (
        <CellMeasurer
          cache={measurerCache}
          columnIndex={0}
          rowIndex={index}
          key={key}
          parent={parent}
        >
          {({ registerChild }) => {
            if (admireOrComment.__typename === 'Admire') {
              return (
                // @ts-expect-error Bad types from react-virtualized
                <ListItem ref={registerChild} justify="space-between" style={style} gap={4}>
                  <HStack gap={4}>
                    <TitleS>{admireOrComment.admirer?.username ?? '<unknown>'}</TitleS>
                    <BaseM>admired this</BaseM>
                  </HStack>

                  <TimeAgoText color={colors.metal}>Just now</TimeAgoText>
                </ListItem>
              );
            } else if (admireOrComment.__typename === 'Comment') {
              return (
                // @ts-expect-error Bad types from react-virtualized
                <ListItem ref={registerChild} justify="space-between" style={style} gap={4}>
                  <HStack gap={4}>
                    <TitleS>{admireOrComment.commenter?.username ?? '<unknown>'}</TitleS>
                    <BaseM>{admireOrComment.comment}</BaseM>
                  </HStack>

                  <TimeAgoText color={colors.metal}>Just now</TimeAgoText>
                </ListItem>
              );
            } else {
              return null;
            }
          }}
        </CellMeasurer>
      );
    },
    [measurerCache, nonNullAdmiresAndComments]
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
                rowCount={nonNullAdmiresAndComments.length}
                rowHeight={measurerCache.rowHeight}
              />
            )}
          </AutoSizer>
        </VStack>
      </WrappingVStack>
    </ModalContent>
  );
}

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
