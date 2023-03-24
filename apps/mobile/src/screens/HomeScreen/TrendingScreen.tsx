import { Suspense, useMemo } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

import { TrendingScreenFragment$key } from '~/generated/TrendingScreenFragment.graphql';
import { TrendingScreenQuery } from '~/generated/TrendingScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';

type TrendingScreenInnerProps = {
  queryRef: TrendingScreenFragment$key;
};

function TrendingScreenInner({ queryRef }: TrendingScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment TrendingScreenFragment on Query {
        trendingFeed(before: $trendingFeedBefore, last: $trendingFeedCount) {
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

export function TrendingScreen() {
  const query = useLazyLoadQuery<TrendingScreenQuery>(
    graphql`
      query TrendingScreenQuery($trendingFeedBefore: String, $trendingFeedCount: Int!) {
        ...TrendingScreenFragment
      }
    `,
    { trendingFeedCount: 50 }
  );

  return (
    <Suspense fallback={null}>
      <TrendingScreenInner queryRef={query} />
    </Suspense>
  );
}
