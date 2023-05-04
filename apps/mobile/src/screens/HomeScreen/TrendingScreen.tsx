import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesList';
import { TrendingScreenFragment$key } from '~/generated/TrendingScreenFragment.graphql';
import { TrendingScreenQuery } from '~/generated/TrendingScreenQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';

type TrendingScreenInnerProps = {
  queryRef: TrendingScreenFragment$key;
};

const PER_PAGE = 20;
const INITIAL_COUNT = 3;

function TrendingScreenInner({ queryRef }: TrendingScreenInnerProps) {
  const {
    data: query,
    hasPrevious,
    loadPrevious,
    isLoadingPrevious,
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
        ...FeedListQueryFragment
      }
    `,
    queryRef
  );

  useEffect(() => {
    if (hasPrevious && !isLoadingPrevious) {
      loadPrevious(PER_PAGE - INITIAL_COUNT);
    }
  }, [hasPrevious, isLoadingPrevious, loadPrevious]);

  const handleLoadMore = useCallback(() => {
    if (hasPrevious && !isLoadingPrevious) {
      loadPrevious(PER_PAGE);
    }
  }, [hasPrevious, isLoadingPrevious, loadPrevious]);

  const events = useMemo(() => {
    return removeNullValues(query.trendingFeed?.edges?.map((it) => it?.node)).reverse();
  }, [query.trendingFeed?.edges]);

  return (
    <FeedList
      isLoadingMore={isLoadingPrevious}
      onLoadMore={handleLoadMore}
      feedEventRefs={events}
      queryRef={query}
    />
  );
}

export function TrendingScreen() {
  const query = useLazyLoadQuery<TrendingScreenQuery>(
    graphql`
      query TrendingScreenQuery(
        $trendingFeedBefore: String
        $trendingFeedCount: Int!
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
        ...TrendingScreenFragment
      }
    `,
    {
      trendingFeedCount: INITIAL_COUNT,
      interactionsFirst: NOTES_PER_PAGE,
    }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <TrendingScreenInner queryRef={query} />
    </Suspense>
  );
}
