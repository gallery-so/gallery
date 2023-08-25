import AsyncStorage from '@react-native-async-storage/async-storage';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { WelcomeToBeta } from '~/components/WelcomeToBeta';
import { CuratedScreenFragment$key } from '~/generated/CuratedScreenFragment.graphql';
import { CuratedScreenQuery } from '~/generated/CuratedScreenQuery.graphql';
import { RefetchableCuratedScreenFragmentQuery } from '~/generated/RefetchableCuratedScreenFragmentQuery.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';

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

        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
        ...FeedListQueryFragment
      }
    `,
    queryRef
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const [showWelcome, setShowWelcome] = useState(false);

  const checkShouldShowWelcome = useCallback(async () => {
    const shown = await AsyncStorage.getItem('welcomeMessageShown');
    if (shown !== 'true') {
      setShowWelcome(true);
      await AsyncStorage.setItem('welcomeMessageShown', 'true');
    }
  }, [setShowWelcome]);

  useEffect(() => {
    checkShouldShowWelcome();
  }, [checkShouldShowWelcome]);

  return (
    <>
      <FeedList
        isLoadingMore={query.isLoadingPrevious}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        feedEventRefs={events}
        queryRef={query.data}
      />
      {showWelcome && <WelcomeToBeta username={query.viewer?.user?.username ?? ''} />}
    </>
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
