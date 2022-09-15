import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import {
  NotesModalFragment$data,
  NotesModalFragment$key,
} from '__generated__/NotesModalFragment.graphql';
import { MODAL_PADDING_THICC_PX } from 'contexts/modal/constants';
import styled from 'styled-components';
import { HStack } from 'components/core/Spacer/Stack';
import colors from 'components/core/colors';
import { BaseM, BaseS, TitleS, TitleXS } from 'components/core/Text/Text';
import { useMemo } from 'react';
import { removeNullValues } from 'utils/removeNullValues';

type NotesModalProps = {
  fullscreen: boolean;
  eventRef: NotesModalFragment$key;
};

type Item =
  | NonNullable<NotesModalFragment$data['comments']>[number]
  | NonNullable<NotesModalFragment$data['admires']>[number];

export function NotesModal({ eventRef, fullscreen }: NotesModalProps) {
  const feedEvent = useFragment(
    graphql`
      fragment NotesModalFragment on FeedEvent {
        dbid
        comments {
          __typename

          comment
          creationTime

          commenter {
            username
          }
        }

        admires {
          __typename

          creationTime
          admirer {
            username
          }
        }
      }
    `,
    eventRef
  );

  const items: Item[] = useMemo(() => {
    const nonNullComments = removeNullValues(feedEvent.comments);
    const nonNullAdmires = removeNullValues(feedEvent.admires);

    return [...nonNullAdmires, ...nonNullComments].sort((a, b) => {
      return a.creationTime - b.creationTime;
    });
  }, [feedEvent.admires, feedEvent.comments]);

  return (
    <ModalContent fullscreen={fullscreen}>
      <StyledHeader>
        <TitleXS>NOTES</TitleXS>
      </StyledHeader>
      {Array.from({ length: 100 }).map(() => {
        return (
          <ListItem justify="space-between" align="center">
            <HStack gap={4}>
              <TitleS>robin</TitleS>
              <BaseM>yooooo this is dope duane</BaseM>
            </HStack>

            <BaseS color={colors.metal}>Just now</BaseS>
          </ListItem>
        );
      })}
    </ModalContent>
  );
}

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
