import { Portal } from '@gorhom/portal';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { WelcomeNewUserOnboarding } from '~/components/Onboarding/WelcomeNewUserOnboarding';
import { CuratedScreenFragment$key } from '~/generated/CuratedScreenFragment.graphql';
import { CuratedScreenQuery } from '~/generated/CuratedScreenQuery.graphql';
import { RefetchableCuratedScreenFragmentQuery } from '~/generated/RefetchableCuratedScreenFragmentQuery.graphql';
import { FeedTabNavigatorParamList } from '~/navigation/types';
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

        viewer @required(action: THROW) {
          ... on Viewer {
            user {
              username
            }
            # ...MarfaCheckInSheetFragment
          }
        }
        ...FeedListQueryFragment
      }
    `,
    queryRef
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // const { params: routeParams } = useRoute<RouteProp<FeedTabNavigatorParamList, 'For You'>>();
  // const showMarfaCheckIn = routeParams?.showMarfaCheckIn ?? false;

  const curatedFeed = query.data.curatedFeed;

  const route = useRoute<RouteProp<FeedTabNavigatorParamList, 'For You'>>();

  const { isNewUser } = route.params ?? {};

  const username = query.data.viewer?.user?.username ?? '';

  const [showWelcome, setShowWelcome] = useState(false);

  const handleWelcomeTooltipCompleted = useCallback(() => {
    setShowWelcome(false);
  }, []);

  useEffect(() => {
    if (isNewUser) {
      setShowWelcome(true);
    }
  }, [isNewUser, setShowWelcome]);

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
    <>
      <FeedList
        isLoadingMore={query.isLoadingPrevious}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        feedEventRefs={events}
        queryRef={query.data}
      />
      {showWelcome && (
        <Portal>
          <WelcomeNewUserOnboarding
            username={username}
            onComplete={handleWelcomeTooltipCompleted}
          />
        </Portal>
      )}
      {/* Keeping for next time we run a similar campaign */}
      {/* {showMarfaCheckIn && <MarfaCheckInSheet viewerRef={query.data.viewer} />} */}
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
