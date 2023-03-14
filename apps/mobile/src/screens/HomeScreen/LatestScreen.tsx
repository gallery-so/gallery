import { Suspense, useMemo } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { LatestScreenFragment$key } from '~/generated/LatestScreenFragment.graphql';
import { LatestScreenQuery } from '~/generated/LatestScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';

type LatestScreenInnerProps = {
  queryRef: LatestScreenFragment$key;
};

function LatestScreenInner({ queryRef }: LatestScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment LatestScreenFragment on Query {
        trendingFeed(before: $globalFeedBefore, last: $globalFeedCount) {
          edges {
            node {
              __typename

              ...FeedListFragment
            }
          }
        }
      }
    `,
    queryRef
  );

  const events = useMemo(() => {
    return removeNullValues(query.trendingFeed?.edges?.map((it) => it?.node)).reverse();
  }, [query.trendingFeed?.edges]);

  return <FeedList feedEventRefs={events} />;
}

export function LatestScreen() {
  const query = useLazyLoadQuery<LatestScreenQuery>(
    graphql`
      query LatestScreenQuery($globalFeedBefore: String, $globalFeedCount: Int!) {
        ...LatestScreenFragment
      }
    `,
    { globalFeedCount: 50 }
  );

  return (
    <Suspense fallback={null}>
      <LatestScreenInner queryRef={query} />
    </Suspense>
  );
}
