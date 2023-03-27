import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { LatestScreenFragment$key } from '~/generated/LatestScreenFragment.graphql';
import { LatestScreenQuery } from '~/generated/LatestScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';

type LatestScreenInnerProps = {
  queryRef: LatestScreenFragment$key;
};

const PER_PAGE = 20;
const INITIAL_COUNT = 3;

function LatestScreenInner({ queryRef }: LatestScreenInnerProps) {
  const {
    data: query,
    isLoadingPrevious,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment LatestScreenFragment on Query
      @refetchable(queryName: "RefetchableLatestScreenFragmentQuery") {
        globalFeed(before: $globalFeedBefore, last: $globalFeedCount)
          @connection(key: "LatestScreenFragment_globalFeed") {
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

  const handleLoadMore = useCallback(() => {
    loadPrevious(PER_PAGE);
  }, [loadPrevious]);

  const events = useMemo(() => {
    return removeNullValues(query.globalFeed?.edges?.map((it) => it?.node)).reverse();
  }, [query.globalFeed?.edges]);

  return (
    <FeedList
      isLoadingMore={isLoadingPrevious}
      onLoadMore={handleLoadMore}
      feedEventRefs={events}
    />
  );
}

export function LatestScreen() {
  const query = useLazyLoadQuery<LatestScreenQuery>(
    graphql`
      query LatestScreenQuery($globalFeedBefore: String, $globalFeedCount: Int!) {
        ...LatestScreenFragment
      }
    `,
    { globalFeedCount: INITIAL_COUNT }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <LatestScreenInner queryRef={query} />
    </Suspense>
  );
}
