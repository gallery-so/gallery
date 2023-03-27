import { Suspense, useEffect, useMemo } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { TrendingScreenFragment$key } from '~/generated/TrendingScreenFragment.graphql';
import { TrendingScreenQuery } from '~/generated/TrendingScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';

type TrendingScreenInnerProps = {
  queryRef: TrendingScreenFragment$key;
};

const PER_PAGE = 10;
const INITIAL_COUNT = 3;

function TrendingScreenInner({ queryRef }: TrendingScreenInnerProps) {
  const {
    data: query,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment TrendingScreenFragment on Query
      @refetchable(queryName: "RefetchableTrendingScreenFragmentQuery") {
        trendingFeed(before: $trendingFeedBefore, last: $trendingFeedCount)
          @connection(key: "TrendingScreenFragment_trendingFeed") {
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

  useEffect(() => {
    if (hasPrevious) {
      loadPrevious(PER_PAGE - INITIAL_COUNT);
    }
  }, [hasPrevious, loadPrevious]);

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
    { trendingFeedCount: INITIAL_COUNT }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <TrendingScreenInner queryRef={query} />
    </Suspense>
  );
}
