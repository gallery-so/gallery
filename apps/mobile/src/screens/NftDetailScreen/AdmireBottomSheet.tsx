import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { UserFollowListFallback } from '~/components/UserFollowList/UserFollowListFallback';
import { AdmireBottomSheetConnectedTokenAdmireListFragment$key } from '~/generated/AdmireBottomSheetConnectedTokenAdmireListFragment.graphql';
import { AdmireBottomSheetConnectedTokenAdmireListFragmentQuery } from '~/generated/AdmireBottomSheetConnectedTokenAdmireListFragmentQuery.graphql';
import { AdmireBottomSheetConnectedTokenAdmireListQuery } from '~/generated/AdmireBottomSheetConnectedTokenAdmireListQuery.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type AdmireBottomSheetProps = {
  tokenId: string;
};

export function AdmireBottomSheet({ tokenId }: AdmireBottomSheetProps) {
  return (
    <View className="flex flex-1 flex-col space-y-5">
      <Typography className="text-sm px-4" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        Admires
      </Typography>

      <View className="flex-grow">
        <Suspense fallback={<UserFollowListFallback />}>
          <ConnectedTokenAdmireList tokenId={tokenId} />
        </Suspense>
      </View>
    </View>
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
