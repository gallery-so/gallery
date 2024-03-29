import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { UserFollowListFallback } from '~/components/UserFollowList/UserFollowListFallback';
import { AdmireBottomSheetConnectedAdmireListFragment$key } from '~/generated/AdmireBottomSheetConnectedAdmireListFragment.graphql';
import { AdmireBottomSheetConnectedAdmireListFragmentQuery } from '~/generated/AdmireBottomSheetConnectedAdmireListFragmentQuery.graphql';
import { AdmireBottomSheetConnectedAdmireListQuery } from '~/generated/AdmireBottomSheetConnectedAdmireListQuery.graphql';
import { AdmireBottomSheetConnectedPostAdmireListFragment$key } from '~/generated/AdmireBottomSheetConnectedPostAdmireListFragment.graphql';
import { AdmireBottomSheetConnectedPostAdmireListFragmentQuery } from '~/generated/AdmireBottomSheetConnectedPostAdmireListFragmentQuery.graphql';
import { AdmireBottomSheetConnectedPostAdmireListQuery } from '~/generated/AdmireBottomSheetConnectedPostAdmireListQuery.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedItemTypes } from '../createVirtualizedFeedEventItems';

const SNAP_POINTS = [350];

type AdmireBottomSheetProps = {
  feedId: string;
  bottomSheetRef: ForwardedRef<GalleryBottomSheetModalType | null>;
  type: FeedItemTypes;
};

export function AdmireBottomSheet({ bottomSheetRef, feedId, type }: AdmireBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const internalRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { bottom } = useSafeAreaPadding();

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        internalRef.current = value;
        if (typeof bottomSheetRef === 'function') {
          bottomSheetRef(value);
        } else if (bottomSheetRef) {
          bottomSheetRef.current = value;
        }
      }}
      snapPoints={SNAP_POINTS}
      onChange={() => setIsOpen(true)}
      android_keyboardInputMode="adjustResize"
      keyboardBlurBehavior="restore"
    >
      <View style={{ paddingBottom: bottom }} className="flex flex-1 flex-col space-y-5">
        <Typography className="text-sm px-4" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Admires
        </Typography>

        <View className="flex-grow">
          <Suspense fallback={<UserFollowListFallback />}>
            {isOpen && <ConnectedAdmireList type={type} feedId={feedId} />}
          </Suspense>
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}
type ConnectedAdmireListProps = {
  type: FeedItemTypes;
  feedId: string;
};
function ConnectedAdmireList({ type, feedId }: ConnectedAdmireListProps) {
  if (type === 'Post') {
    return <ConnectedPostAdmireList feedId={feedId} />;
  }

  return <ConnectedEventAdmireList feedId={feedId} />;
}

export function ConnectedEventAdmireList({ feedId }: { feedId: string }) {
  const queryRef = useLazyLoadQuery<AdmireBottomSheetConnectedAdmireListQuery>(
    graphql`
      query AdmireBottomSheetConnectedAdmireListQuery(
        $feedEventId: DBID!
        $last: Int!
        $before: String
      ) {
        ...AdmireBottomSheetConnectedAdmireListFragment
        ...AdmireBottomSheetConnectedPostAdmireListFragment
      }
    `,
    { feedEventId: feedId, last: 10 }
  );

  const {
    data: query,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment<
    AdmireBottomSheetConnectedAdmireListFragmentQuery,
    AdmireBottomSheetConnectedAdmireListFragment$key
  >(
    graphql`
      fragment AdmireBottomSheetConnectedAdmireListFragment on Query
      @refetchable(queryName: "AdmireBottomSheetConnectedAdmireListFragmentQuery") {
        feedEventById(id: $feedEventId) {
          ... on FeedEvent {
            admires(last: $last, before: $before) @connection(key: "AdmireBottomSheet_admires") {
              edges {
                node {
                  admirer {
                    ...UserFollowListFragment
                  }
                }
              }
            }
          }
        }

        ...UserFollowListQueryFragment
      }
    `,
    queryRef
  );

  const admirers = useMemo(() => {
    return removeNullValues(
      query.feedEventById?.admires?.edges?.map((edge) => edge?.node?.admirer)
    );
  }, [query.feedEventById?.admires?.edges]);

  const handleLoadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(10);
    }
  }, [hasPrevious, loadPrevious]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUserPress = useCallback(
    (username: string) => {
      navigation.push('Profile', { username: username });
    },
    [navigation]
  );

  return (
    <UserFollowList
      onLoadMore={handleLoadMore}
      userRefs={admirers}
      queryRef={query}
      onUserPress={handleUserPress}
    />
  );
}

export function ConnectedPostAdmireList({ feedId }: { feedId: string }) {
  const queryRef = useLazyLoadQuery<AdmireBottomSheetConnectedPostAdmireListQuery>(
    graphql`
      query AdmireBottomSheetConnectedPostAdmireListQuery(
        $feedEventId: DBID!
        $last: Int!
        $before: String
      ) {
        ...AdmireBottomSheetConnectedPostAdmireListFragment
      }
    `,
    { feedEventId: feedId, last: 10 }
  );

  const {
    data: query,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment<
    AdmireBottomSheetConnectedPostAdmireListFragmentQuery,
    AdmireBottomSheetConnectedPostAdmireListFragment$key
  >(
    graphql`
      fragment AdmireBottomSheetConnectedPostAdmireListFragment on Query
      @refetchable(queryName: "AdmireBottomSheetConnectedPostAdmireListFragmentQuery") {
        postById(id: $feedEventId) {
          ... on Post {
            admires(last: $last, before: $before) @connection(key: "AdmireBottomSheet_admires") {
              edges {
                node {
                  admirer {
                    ...UserFollowListFragment
                  }
                }
              }
            }
          }
        }

        ...UserFollowListQueryFragment
      }
    `,
    queryRef
  );

  const admirers = useMemo(() => {
    return removeNullValues(query.postById?.admires?.edges?.map((edge) => edge?.node?.admirer));
  }, [query.postById?.admires?.edges]);

  const handleLoadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(10);
    }
  }, [hasPrevious, loadPrevious]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUserPress = useCallback(
    (username: string) => {
      navigation.push('Profile', { username: username });
    },
    [navigation]
  );

  return (
    <UserFollowList
      onLoadMore={handleLoadMore}
      userRefs={admirers}
      queryRef={query}
      onUserPress={handleUserPress}
    />
  );
}
