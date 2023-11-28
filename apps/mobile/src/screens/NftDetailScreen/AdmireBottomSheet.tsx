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
import { AdmireBottomSheetConnectedTokenAdmireListFragment$key } from '~/generated/AdmireBottomSheetConnectedTokenAdmireListFragment.graphql';
import { AdmireBottomSheetConnectedTokenAdmireListFragmentQuery } from '~/generated/AdmireBottomSheetConnectedTokenAdmireListFragmentQuery.graphql';
import { AdmireBottomSheetConnectedTokenAdmireListQuery } from '~/generated/AdmireBottomSheetConnectedTokenAdmireListQuery.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

const SNAP_POINTS = [350];

type AdmireBottomSheetProps = {
  tokenId: string;
  bottomSheetRef: ForwardedRef<GalleryBottomSheetModalType | null>;
};

export function AdmireBottomSheet({ bottomSheetRef, tokenId }: AdmireBottomSheetProps) {
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
            {isOpen && <ConnectedTokenAdmireList tokenId={tokenId} />}
          </Suspense>
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

export function ConnectedTokenAdmireList({ tokenId }: { tokenId: string }) {
  const queryRef = useLazyLoadQuery<AdmireBottomSheetConnectedTokenAdmireListQuery>(
    graphql`
      query AdmireBottomSheetConnectedTokenAdmireListQuery(
        $tokenId: DBID!
        $last: Int!
        $before: String
      ) {
        ...AdmireBottomSheetConnectedTokenAdmireListFragment
      }
    `,
    { tokenId: tokenId, last: 10 }
  );

  const {
    data: query,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment<
    AdmireBottomSheetConnectedTokenAdmireListFragmentQuery,
    AdmireBottomSheetConnectedTokenAdmireListFragment$key
  >(
    graphql`
      fragment AdmireBottomSheetConnectedTokenAdmireListFragment on Query
      @refetchable(queryName: "AdmireBottomSheetConnectedTokenAdmireListFragmentQuery") {
        tokenById(id: $tokenId) {
          ... on Token {
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
    return removeNullValues(query.tokenById?.admires?.edges?.map((edge) => edge?.node?.admirer));
  }, [query.tokenById?.admires?.edges]);

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
