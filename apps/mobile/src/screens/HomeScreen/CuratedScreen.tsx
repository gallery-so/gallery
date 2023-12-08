import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { MarfaCheckInSheet } from '~/components/MarfaCheckIn/MarfaCheckInSheet';
import { WelcomeNewUser } from '~/components/WelcomeNewUser';
import { CuratedScreenFragment$key } from '~/generated/CuratedScreenFragment.graphql';
import { CuratedScreenQuery } from '~/generated/CuratedScreenQuery.graphql';
import { RefetchableCuratedScreenFragmentQuery } from '~/generated/RefetchableCuratedScreenFragmentQuery.graphql';
import { FeedTabNavigatorParamList } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';

import { FeedList } from '../../components/Feed/FeedList';
import { LoadingFeedList } from '../../components/Feed/LoadingFeedList';
import { SharePostBottomSheet } from '../PostScreen/SharePostBottomSheet';
import { Button } from '~/components/Button';

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
            ...MarfaCheckInSheetFragment
          }
        }
        ...FeedListQueryFragment
      }
    `,
    queryRef
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { params: routeParams } = useRoute<RouteProp<FeedTabNavigatorParamList, 'For You'>>();
  const showMarfaCheckIn = routeParams?.showMarfaCheckIn ?? false;
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const curatedFeed = query.data.curatedFeed;

  const route = useRoute<RouteProp<FeedTabNavigatorParamList, 'For You'>>();
  const [showWelcome, setShowWelcome] = useState(false);

  const { isNewUser } = route.params ?? {};

  useEffect(() => {
    console.log('effect running');

    if (routeParams?.postId) {
      console.log('found postId in route params', routeParams?.postId);

      bottomSheetRef.current?.present();
    }
  }, [routeParams?.postId]);

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
      <Button text="dummy" onPress={() => bottomSheetRef.current?.present()} />
      <FeedList
        isLoadingMore={query.isLoadingPrevious}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        feedEventRefs={events}
        queryRef={query.data}
      />
      {showWelcome && <WelcomeNewUser username={query.data.viewer?.user?.username ?? ''} />}
      {showMarfaCheckIn && <MarfaCheckInSheet viewerRef={query.data.viewer} />}

      <SharePostBottomSheet
        key={routeParams?.postId}
        ref={bottomSheetRef}
        postId={routeParams?.postId ?? ''}
        creatorName={routeParams?.postId ?? ''}
      />
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
