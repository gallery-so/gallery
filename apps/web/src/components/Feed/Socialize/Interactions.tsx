import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { VStack } from '~/components/core/Spacer/Stack';
import { CommentLine } from '~/components/Feed/Socialize/CommentLine';
import { RemainingCommentCount } from '~/components/Feed/Socialize/RemainingCommentCount';
import { InteractionsFragment$key } from '~/generated/InteractionsFragment.graphql';
import { InteractionsQueryFragment$key } from '~/generated/InteractionsQueryFragment.graphql';

type Props = {
  onPotentialLayoutShift: () => void;
  eventRef: InteractionsFragment$key;
  queryRef: InteractionsQueryFragment$key;
};

export function Interactions({ eventRef, queryRef, onPotentialLayoutShift }: Props) {
  const event = useFragment(
    graphql`
      fragment InteractionsFragment on FeedEvent {
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

        ...RemainingCommentCountFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment InteractionsQueryFragment on Query {
        ...RemainingCommentCountQueryFragment
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

  const totalComments = event.comments?.pageInfo.total ?? 0;

  const isFirstMount = useRef(true);
  useLayoutEffect(() => {
    if (!isFirstMount.current) {
      onPotentialLayoutShift();
    }

    isFirstMount.current = false;

    // These are all the things that might cause the layout to shift
  }, [onPotentialLayoutShift, nonNullComments, totalComments]);

  /**
   * The below logic is a bit annoying to read so I'll try to explain it here
   *
   * If there are any comments, we'll show the following
   * - Comment 1
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
    const lastComment = nonNullComments.slice(-1);

    if (lastComment.length > 0) {
      return (
        <VStack gap={8}>
          <VStack>
            {lastComment.map((comment) => {
              return <CommentLine key={comment.dbid} commentRef={comment} />;
            })}
          </VStack>

          <RemainingCommentCount eventRef={event} totalComments={totalComments} queryRef={query} />
        </VStack>
      );
    }

    return (
      <RemainingCommentCount eventRef={event} totalComments={totalComments} queryRef={query} />
    );
  }

  return null;
}
