import { useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { AdmireFeedEventModalFragment$key } from '~/generated/AdmireFeedEventModalFragment.graphql';
import { AdmireFeedEventModalQueryFragment$key } from '~/generated/AdmireFeedEventModalQueryFragment.graphql';

import { AdmireModal } from './AdmireModal';

type Props = {
  fullscreen: boolean;
  eventRef: AdmireFeedEventModalFragment$key;
  queryRef: AdmireFeedEventModalQueryFragment$key;
};

export default function AdmireFeedEventModal({ eventRef, queryRef, fullscreen }: Props) {
  const {
    data: feedEvent,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment AdmireFeedEventModalFragment on FeedEvent
      @refetchable(queryName: "AdmireFeedEventModalRefetchableFragment") {
        interactions(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "AdmiresModal_interactions") {
          edges {
            node {
              __typename

              ... on Admire {
                ...AdmireModalFragment
              }
            }
          }
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment AdmireFeedEventModalQueryFragment on Query {
        ...AdmireModalQueryFragment
      }
    `,
    queryRef
  );

  const nonNullInteractions = useMemo(() => {
    const interactions = [];

    for (const interaction of feedEvent.interactions?.edges ?? []) {
      if (interaction?.node && interaction.node.__typename === 'Admire') {
        interactions.push(interaction.node);
      }
    }

    return interactions.reverse();
  }, [feedEvent.interactions?.edges]);

  return (
    <AdmireModal
      admireRefs={nonNullInteractions}
      queryRef={query}
      fullscren={fullscreen}
      loadPrevious={loadPrevious}
      hasPrevious={hasPrevious}
    />
  );
}
