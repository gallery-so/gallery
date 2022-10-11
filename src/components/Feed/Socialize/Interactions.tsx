import { VStack } from 'components/core/Spacer/Stack';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CommentLine } from 'components/Feed/Socialize/CommentLine';
import { AdmireLine } from 'components/Feed/Socialize/AdmireLine';
import { RemainingAdmireCount } from 'components/Feed/Socialize/RemainingAdmireCount';
import { NoteModalOpenerText } from 'components/Feed/Socialize/NoteModalOpenerText';
import { useMemo } from 'react';
import { InteractionsQueryFragment$key } from '../../../../__generated__/InteractionsQueryFragment.graphql';
import { InteractionsFragment$key } from '../../../../__generated__/InteractionsFragment.graphql';

type Props = {
  eventRef: InteractionsFragment$key;
  queryRef: InteractionsQueryFragment$key;
};

export function Interactions({ eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment InteractionsFragment on FeedEvent {
        admires(first: 1) @connection(key: "Interactions_admires") {
          pageInfo {
            total
          }
          edges {
            node {
              dbid

              ...AdmireLineFragment
            }
          }
        }

        comments(first: 2) @connection(key: "Interactions_comments") {
          pageInfo {
            total
          }
          edges {
            node {
              dbid

              ...CommentLineFragment
            }
          }
        }

        ...RemainingAdmireCountFragment
        ...NoteModalOpenerTextFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment InteractionsQueryFragment on Query {
        ...AdmireLineQueryFragment
      }
    `,
    queryRef
  );

  const nonNullComments = useMemo(() => {
    const comments = [];

    for (const edge of event.comments?.edges ?? []) {
      if (edge?.node) {
        comments.push(edge.node);
      }
    }

    return comments;
  }, [event.comments?.edges]);

  const nonNullAdmires = useMemo(() => {
    const comments = [];

    for (const edge of event.admires?.edges ?? []) {
      if (edge?.node) {
        comments.push(edge.node);
      }
    }

    return comments;
  }, [event.admires?.edges]);

  const totalInteractions =
    (event.admires?.pageInfo.total ?? 0) + (event.comments?.pageInfo.total ?? 0);

  if (nonNullComments.length) {
    const lastTwoComments = nonNullComments.slice(0, 2);

    // 2 comments and "+ x others" below
    // Not hard coding 2 here since there might only be one comment from the slice
    const remainingAdmiresAndComments = Math.max(totalInteractions - lastTwoComments.length, 0);

    return (
      <VStack gap={8}>
        {nonNullComments?.slice(0, 2).map((comment) => {
          return <CommentLine key={comment.dbid} commentRef={comment} />;
        })}

        <RemainingAdmireCount remainingCount={remainingAdmiresAndComments} eventRef={event} />
      </VStack>
    );
  } else if (nonNullAdmires.length) {
    const remainingInteractions = Math.max(totalInteractions - nonNullAdmires.length, 0);

    if (nonNullAdmires.length === 1) {
      // show just the admire line "robin admired this"
      // if it was the logged in user "you admired this"
      const [admire] = nonNullAdmires;

      return (
        <VStack gap={8}>
          <AdmireLine admireRef={admire} queryRef={query} />

          <RemainingAdmireCount remainingCount={remainingInteractions} eventRef={event} />
        </VStack>
      );
    } else {
      // link x admired this
      return (
        <VStack gap={8}>
          <NoteModalOpenerText eventRef={event}>
            {event.admires?.pageInfo.total} admired this
          </NoteModalOpenerText>

          <RemainingAdmireCount remainingCount={remainingInteractions} eventRef={event} />
        </VStack>
      );
    }
  }

  return null;
}
