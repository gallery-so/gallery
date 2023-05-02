import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { InteractionsFragment$key } from '~/generated/InteractionsFragment.graphql';
import { InteractionsQueryFragment$key } from '~/generated/InteractionsQueryFragment.graphql';

import { AdmireLine } from './AdmireLine';
import { CommentLine } from './CommentLine';
import { RemainingAdmireCount } from './RemainingAdmireCount';

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
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment InteractionsQueryFragment on Query {
        ...AdmireLineQueryFragment
        ...RemainingAdmireCountQueryFragment
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

  if (totalComments > 0) {
    const lastTwoComments = nonNullComments.slice(-2);
    if (lastTwoComments.length > 0) {
      // 2 comments and "+ x others" below
      // Not hard coding 2 here since there might only be one comment from the slice
      const remainingAdmiresAndComments = Math.max(totalInteractions - lastTwoComments.length, 0);

      return (
        <View>
          {lastTwoComments.map((comment) => {
            return <CommentLine key={comment.dbid} commentRef={comment} />;
          })}

          <RemainingAdmireCount
            remainingCount={remainingAdmiresAndComments}
            eventRef={event}
            queryRef={query}
          />
        </View>
      );
    }

    return (
      <RemainingAdmireCount remainingCount={totalInteractions} eventRef={event} queryRef={query} />
    );
  }

  if (totalAdmires > 0) {
    const [admire] = nonNullAdmires;

    if (admire) {
      return <AdmireLine admireRef={admire} queryRef={query} />;
    }
  }

  return <View />;
}
