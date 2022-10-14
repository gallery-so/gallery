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
        # We only show 1 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        admires(last: 5) @connection(key: "Interactions_admires") {
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

        # We only show 2 but in case the user deletes something
        # we want to be sure that we can show another comment beneath
        comments(last: 5) @connection(key: "Interactions_comments") {
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

    comments.reverse();

    return comments;
  }, [event.comments?.edges]);

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const edge of event.admires?.edges ?? []) {
      if (edge?.node) {
        admires.push(edge.node);
      }
    }

    admires.reverse();

    return admires;
  }, [event.admires?.edges]);

  const totalComments = event.comments?.pageInfo.total ?? 0;
  const totalAdmires = event.admires?.pageInfo.total ?? 0;
  const totalInteractions = totalComments + totalAdmires;

  /**
   * The below logic is a bit annoying to read so I'll try to explain it here
   *
   * If there are any comments, we'll show the following
   * - Comment 1
   * - Comment 2
   * - X Others => Link to NotesModal
   *
   * If there are no comments, but there are any admires, we'll show the following
   *    If there's only 1 admires
   *      Show "Person admired this"
   *    If there's > 1 admire
   *      Show "X admired this" => Link to NotesModal
   *
   * Extra:
   * There's a bit of extra logic you can see where we're checking the `PageInfo.total`
   * as well as checking the actual length of the admires / comments array.
   *
   * This is because there is a possibility that the user will either delete a comment
   * or delete an admire. Under this case, the total count of comments / admires might
   * be some large number, but we only actually have 0, 1, or 2 in the list
   *
   * Imagine this:
   * 1. We load the page, and we hypothetically fetch 5 comments posted by the logged in user
   * 2. There's actually a total of 10 comments on the server, but we only fetched 5
   * 3. The user then goes and deletes all 5 of those comments
   *
   * Now we're in a state where `totalComments` is 5, but we don't actually have any comments
   * to show, so we'll have to fallback to some other UI here. In this case, we'll just show
   * the total number of comments / admires that links to the NotesModal
   */
  if (totalComments > 0) {
    const lastTwoComments = nonNullComments.slice(0, 2);

    if (lastTwoComments.length > 0) {
      // 2 comments and "+ x others" below
      // Not hard coding 2 here since there might only be one comment from the slice
      const remainingAdmiresAndComments = Math.max(totalInteractions - lastTwoComments.length, 0);

      return (
        <VStack gap={8}>
          {lastTwoComments.map((comment) => {
            return <CommentLine key={comment.dbid} commentRef={comment} />;
          })}

          <RemainingAdmireCount remainingCount={remainingAdmiresAndComments} eventRef={event} />
        </VStack>
      );
    }

    return <RemainingAdmireCount remainingCount={totalInteractions} eventRef={event} />;
  }

  if (totalAdmires > 0) {
    if (totalAdmires === 1) {
      const [admire] = nonNullAdmires;

      if (admire) {
        return <AdmireLine admireRef={admire} queryRef={query} />;
      }
    }

    return <NoteModalOpenerText eventRef={event}>{totalAdmires} admired this</NoteModalOpenerText>;
  }

  return null;
}
