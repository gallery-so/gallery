import { VStack } from 'components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from 'components/core/Text/Text';
import styled from 'styled-components';
import colors from 'components/core/colors';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CommentLine } from 'components/Feed/Socialize/CommentLine';
import { CommentsAndAdmiresFragment$key } from '../../../../__generated__/CommentsAndAdmiresFragment.graphql';
import { AdmireLine } from 'components/Feed/Socialize/AdmireLine';
import { CommentsAndAdmiresQueryFragment$key } from '../../../../__generated__/CommentsAndAdmiresQueryFragment.graphql';
import { RemainingAdmireCount } from 'components/Feed/Socialize/RemainingAdmireCount';
import { NoteModalOpenerText } from 'components/Feed/Socialize/NoteModalOpenerText';

type Props = {
  eventRef: CommentsAndAdmiresFragment$key;
  queryRef: CommentsAndAdmiresQueryFragment$key;
};

export function CommentsAndAdmires({ eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CommentsAndAdmiresFragment on FeedEvent {
        admires {
          dbid

          ...AdmireLineFragment
        }

        comments {
          dbid

          ...CommentLineFragment
        }

        ...RemainingAdmireCountFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment CommentsAndAdmiresQueryFragment on Query {
        ...AdmireLineQueryFragment
      }
    `,
    queryRef
  );

  const totalAdmiresAndComments = (event.admires?.length ?? 0) + (event.comments?.length ?? 0);

  if (event.comments?.length) {
    const lastTwoComments = event.comments.slice(0, 2);

    // 2 comments and "+ x others" below
    // Not hard coding 2 here since there might only be one comment from the slice
    const remainingAdmiresAndComments = totalAdmiresAndComments - lastTwoComments.length;

    return (
      <VStack gap={8}>
        {event.comments?.slice(0, 2).map((comment) => {
          return <CommentLine key={comment.dbid} commentRef={comment} />;
        })}

        {remainingAdmiresAndComments > 0 && (
          <RemainingAdmireCount remainingCount={remainingAdmiresAndComments} eventRef={event} />
        )}
      </VStack>
    );
  } else if (event.admires?.length) {
    const remainingAdmiresAndComments = totalAdmiresAndComments - event.admires.length;

    if (event.admires.length === 1) {
      // show just the admire line "robin admired this"
      // if it was the logged in user "you admired this"
      const [admire] = event.admires;

      return (
        <VStack gap={8}>
          <AdmireLine admireRef={admire} queryRef={query} />

          <RemainingAdmireCount remainingCount={remainingAdmiresAndComments} eventRef={event} />
        </VStack>
      );
    } else {
      // link x admired this
      return (
        <VStack gap={8}>
          <NoteModalOpenerText eventRef={event}>
            {event.admires.length} admired this
          </NoteModalOpenerText>

          <RemainingAdmireCount remainingCount={remainingAdmiresAndComments} eventRef={event} />
        </VStack>
      );
    }
  }

  return null;
}
