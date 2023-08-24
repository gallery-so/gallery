import { Suspense, useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { CuratedScreenFragment$key } from '~/generated/CuratedScreenFragment.graphql';
import { CuratedScreenQuery } from '~/generated/CuratedScreenQuery.graphql';
import { RefetchableCuratedScreenFragmentQuery } from '~/generated/RefetchableCuratedScreenFragmentQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';
import { RouteProp, useNavigationState, useRoute } from '@react-navigation/native';
import { FeedTabNavigatorParamList, MainTabStackNavigatorParamList } from '~/navigation/types';

type CuratedScreenInnerProps = {
  queryRef: CuratedScreenFragment$key;
};

const PER_PAGE = 20;

function CuratedScreenInner({ queryRef }: CuratedScreenInnerProps) {
  const query = usePaginationFragment<
    RefetchableCuratedScreenFragmentQuery,
    CuratedScreenFragment$key
  >(
    graphql`
      fragment CuratedScreenFragment on Query
      @refetchable(queryName: "RefetchableCuratedScreenFragmentQuery") {
        curatedFeed(before: $curatedFeedBefore, last: $curatedFeedCount)
          @connection(key: "CuratedScreenFragment_curatedFeed") {
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

  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentScreen = useNavigationState((state) => state);
  console.log({ currentScreen });
  const { params: routeParams } = useRoute<RouteProp<FeedTabNavigatorParamList, 'Curated'>>();
  console.log('route', routeParams);

  const curatedFeed = query.data.curatedFeed;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    query.refetch(
      {},
      {
        fetchPolicy: 'store-and-network',
        onComplete: () => {
          setIsRefreshing(false);
        },
      }
    );
  }, [query]);

  const handleLoadMore = useCallback(() => {
    if (query.isLoadingPrevious) {
      return;
    }

    if (query.hasPrevious) {
      query.loadPrevious(PER_PAGE);
    }
  }, [query]);

  const events = useMemo(() => {
    const curatedEvents = removeNullValues(curatedFeed?.edges?.map((it) => it?.node).reverse());

    return [...curatedEvents];
  }, [curatedFeed?.edges]);

  return (
    <FeedList
      isLoadingMore={query.isLoadingPrevious}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      onLoadMore={handleLoadMore}
      feedEventRefs={events}
      queryRef={query.data}
    />
  );
}

export function CuratedScreen() {
  const query = useLazyLoadQuery<CuratedScreenQuery>(
    graphql`
      query CuratedScreenQuery($curatedFeedBefore: String, $curatedFeedCount: Int!) {
        ...CuratedScreenFragment
      }
    `,
    {
      curatedFeedCount: PER_PAGE,
    }
  );

  return (
    <Suspense fallback={<LoadingFeedList />}>
      <CuratedScreenInner queryRef={query} />
    </Suspense>
  );
}
