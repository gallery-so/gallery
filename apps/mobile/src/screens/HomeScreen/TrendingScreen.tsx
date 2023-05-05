import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { graphql, useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesList';
import { RefetchableTrendingScreenGlobalFragmentQuery } from '~/generated/RefetchableTrendingScreenGlobalFragmentQuery.graphql';
import { RefetchableTrendingScreenTrendingFragmentQuery } from '~/generated/RefetchableTrendingScreenTrendingFragmentQuery.graphql';
import { TrendingScreenFragment$key } from '~/generated/TrendingScreenFragment.graphql';
import { TrendingScreenGlobalFragment$key } from '~/generated/TrendingScreenGlobalFragment.graphql';
import { TrendingScreenQuery } from '~/generated/TrendingScreenQuery.graphql';
import { TrendingScreenTrendingFragment$key } from '~/generated/TrendingScreenTrendingFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';

type TrendingScreenInnerProps = {
  queryRef: TrendingScreenFragment$key;
};

const PER_PAGE = 20;
const INITIAL_COUNT = 3;

function TrendingScreenInner({ queryRef }: TrendingScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment TrendingScreenFragment on Query {
        ...TrendingScreenTrendingFragment
        ...TrendingScreenGlobalFragment

        ...FeedListQueryFragment
      }
    `,
    queryRef
  );

  const globalFeed = usePaginationFragment<
    RefetchableTrendingScreenGlobalFragmentQuery,
    TrendingScreenGlobalFragment$key
  >(
    graphql`
      fragment TrendingScreenGlobalFragment on Query
      @refetchable(queryName: "RefetchableTrendingScreenGlobalFragmentQuery") {
        globalFeed(before: $trendingFeedBefore, last: $trendingFeedCount)
          @connection(key: "TrendingScreenFragment_globalFeed") {
          edges {
            node {
              __typename

              ...FeedListFragment
            }
          }
        }
      }
    `,
    query
  );

  const trendingFeed = usePaginationFragment<
    RefetchableTrendingScreenTrendingFragmentQuery,
    TrendingScreenTrendingFragment$key
  >(
    graphql`
      fragment TrendingScreenTrendingFragment on Query
      @refetchable(queryName: "RefetchableTrendingScreenTrendingFragmentQuery") {
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
    query
  );

  useEffect(() => {
    if (trendingFeed.hasPrevious) {
      trendingFeed.loadPrevious(PER_PAGE - INITIAL_COUNT);
    }
  }, [trendingFeed]);

  const handleLoadMore = useCallback(() => {
    if (trendingFeed.isLoadingPrevious || globalFeed.isLoadingPrevious) {
      return;
    }

    if (trendingFeed.hasPrevious) {
      trendingFeed.loadPrevious(PER_PAGE);
    } else if (globalFeed.hasPrevious) {
      globalFeed.loadPrevious(PER_PAGE);
    }
  }, [globalFeed, trendingFeed]);

  const events = useMemo(() => {
    const trendingEvents = removeNullValues(
      trendingFeed.data.trendingFeed?.edges?.map((it) => it?.node).reverse()
    );

    const globalEvents = removeNullValues(
      globalFeed.data.globalFeed?.edges?.map((it) => it?.node).reverse()
    );

    return [...trendingEvents, ...globalEvents];
  }, [globalFeed.data.globalFeed?.edges, trendingFeed.data.trendingFeed?.edges]);

  return (
    <FeedList
      isLoadingMore={trendingFeed.isLoadingPrevious || globalFeed.isLoadingPrevious}
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
