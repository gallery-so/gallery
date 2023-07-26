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
        admires(last: $interactionsFirst, before: $interactionsAfter)
          @connection(key: "AdmiresModal_admires") {
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

  const nonNullAdmires = useMemo(() => {
    const admires = [];

    for (const admire of feedEvent.admires?.edges ?? []) {
      if (admire?.node && admire.node.__typename === 'Admire') {
        admires.push(admire.node);
      }
    }

    return admires.reverse();
  }, [feedEvent.admires?.edges]);

  return (
    <AdmireModal
      admireRefs={nonNullAdmires}
      queryRef={query}
      fullscreen={fullscreen}
      loadPrevious={loadPrevious}
      hasPrevious={hasPrevious}
    />
  );
}
