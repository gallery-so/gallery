import { Suspense, useCallback, useMemo, useState } from 'react';
import { graphql, useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { CuratedScreenFeatureQuery } from '~/generated/CuratedScreenFeatureQuery.graphql';
import { CuratedScreenFragment$key } from '~/generated/CuratedScreenFragment.graphql';
import { CuratedScreenGlobalFragment$key } from '~/generated/CuratedScreenGlobalFragment.graphql';
import { CuratedScreenQuery } from '~/generated/CuratedScreenQuery.graphql';
import { CuratedScreenTrendingFragment$key } from '~/generated/CuratedScreenTrendingFragment.graphql';
import { RefetchableCuratedScreenGlobalFragmentQuery } from '~/generated/RefetchableCuratedScreenGlobalFragmentQuery.graphql';
import { RefetchableCuratedScreenTrendingFragmentQuery } from '~/generated/RefetchableCuratedScreenTrendingFragmentQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';

type CuratedScreenInnerProps = {
  queryRef: CuratedScreenFragment$key;
};

const PER_PAGE = 20;

function CuratedScreenInner({ queryRef }: CuratedScreenInnerProps) {
  const query = useFragment(
    graphql`
      fragment CuratedScreenFragment on Query {
        ...CuratedScreenTrendingFragment
        ...CuratedScreenGlobalFragment

        ...FeedListQueryFragment
      }
    `,
    queryRef
  );

  const globalFeed = usePaginationFragment<
    RefetchableCuratedScreenGlobalFragmentQuery,
    CuratedScreenGlobalFragment$key
  >(
    graphql`
      fragment CuratedScreenGlobalFragment on Query
      @refetchable(queryName: "RefetchableCuratedScreenGlobalFragmentQuery") {
        globalFeed(
          before: $curatedFeedBefore
          last: $curatedFeedCount
          includePosts: $includePosts
        ) @connection(key: "CuratedScreenFragment_globalFeed") {
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

  const curatedFeed = usePaginationFragment<
    RefetchableCuratedScreenTrendingFragmentQuery,
    CuratedScreenTrendingFragment$key
  >(
    graphql`
      fragment CuratedScreenTrendingFragment on Query
      @refetchable(queryName: "RefetchableCuratedScreenTrendingFragmentQuery") {
        curatedFeed(before: $curatedFeedBefore, last: $curatedFeedCount)
          @connection(key: "TrendingScreenFragment_curatedFeed") {
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

  const [isGlobalFeedRefreshing, setIsGlobalFeedRefreshing] = useState(false);
  const [isCuratedFeedRefreshing, setIsCuratedFeedRefreshing] = useState(false);
  const isRefreshing = isGlobalFeedRefreshing || isCuratedFeedRefreshing;

  const handleRefresh = useCallback(() => {
    setIsGlobalFeedRefreshing(true);
    setIsCuratedFeedRefreshing(true);

    curatedFeed.refetch(
      {},
      {
        fetchPolicy: 'store-and-network',
        onComplete: () => {
          setIsCuratedFeedRefreshing(false);
        },
      }
    );

    globalFeed.refetch(
      {},
      {
        fetchPolicy: 'store-and-network',
        onComplete: () => {
          setIsGlobalFeedRefreshing(false);
        },
      }
    );
  }, [globalFeed, curatedFeed]);

  const handleLoadMore = useCallback(() => {
    if (curatedFeed.isLoadingPrevious || globalFeed.isLoadingPrevious) {
      return;
    }

    if (curatedFeed.hasPrevious) {
      curatedFeed.loadPrevious(PER_PAGE);
    } else if (globalFeed.hasPrevious) {
      globalFeed.loadPrevious(PER_PAGE);
    }
  }, [globalFeed, curatedFeed]);

  const events = useMemo(() => {
    const curatedEvents = removeNullValues(
      curatedFeed.data.curatedFeed?.edges?.map((it) => it?.node).reverse()
    );

    const globalEvents = removeNullValues(
      globalFeed.data.globalFeed?.edges?.map((it) => it?.node).reverse()
    );

    return [...curatedEvents, ...globalEvents];
  }, [globalFeed.data.globalFeed?.edges, curatedFeed.data.curatedFeed?.edges]);

  return (
    <FeedList
      isLoadingMore={curatedFeed.isLoadingPrevious || globalFeed.isLoadingPrevious}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      onLoadMore={handleLoadMore}
      feedEventRefs={events}
      queryRef={query}
    />
  );
}

export function CuratedScreen() {
  const featureQuery = useLazyLoadQuery<CuratedScreenFeatureQuery>(
    graphql`
      query CuratedScreenFeatureQuery {
        ...isFeatureEnabledFragment
      }
    `,
    {}
  );

  const isPostEnabled = isFeatureEnabled(FeatureFlag.KOALA, featureQuery);

  const query = useLazyLoadQuery<CuratedScreenQuery>(
    graphql`
      query CuratedScreenQuery(
        $curatedFeedBefore: String
        $curatedFeedCount: Int!
        $includePosts: Boolean!
      ) {
        ...CuratedScreenFragment
      }
    `,
    {
      curatedFeedCount: PER_PAGE,
      includePosts: isPostEnabled,
    }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <CuratedScreenInner queryRef={query} />
    </Suspense>
  );
}
