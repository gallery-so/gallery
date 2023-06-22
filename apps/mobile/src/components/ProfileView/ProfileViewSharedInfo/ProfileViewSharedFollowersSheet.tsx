import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { ProfileViewSharedFollowersSheetFragment$key } from '~/generated/ProfileViewSharedFollowersSheetFragment.graphql';
import { ProfileViewSharedFollowersSheetQuery } from '~/generated/ProfileViewSharedFollowersSheetQuery.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { useListContentStyle } from '../Tabs/useListContentStyle';

type Props = {
  userRef: ProfileViewSharedFollowersSheetFragment$key;
};

const snapPoints = ['50%'];

function ProfileViewSharedFollowersSheet(
  props: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment ProfileViewSharedFollowersSheetFragment on GalleryUser
      @refetchable(queryName: "ProfileViewSharedFollowersSheetRefetchableFragment") {
        sharedFollowers(first: $sharedFollowersFirst, after: $sharedFollowersAfter)
          @connection(key: "UserSharedInfoFragment_sharedFollowers") {
          edges {
            node {
              __typename
              ... on GalleryUser {
                ...UserFollowListFragment
              }
            }
          }
        }
      }
    `,
    props.userRef
  );

  const query = useLazyLoadQuery<ProfileViewSharedFollowersSheetQuery>(
    graphql`
      query ProfileViewSharedFollowersSheetQuery {
        ...UserFollowListQueryFragment
      }
    `,
    {}
  );

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of data.sharedFollowers?.edges ?? []) {
      if (edge?.node?.__typename === 'GalleryUser' && edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [data.sharedFollowers?.edges]);

  const handleLoadMore = useCallback(() => {
    if (hasNext) {
      loadNext(20);
    }
  }, [hasNext, loadNext]);

  const contentContainerStyle = useListContentStyle();

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUserPress = useCallback(
    (username: string) => {
      navigation.push('Profile', { username: username });
    },
    [navigation]
  );
  return (
    <GalleryBottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
      <View style={contentContainerStyle}>
        <Typography
          className="text-sm mb-4 px-4"
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
        >
          Followers
        </Typography>

        <View className="flex-grow">
          <UserFollowList
            onUserPress={handleUserPress}
            onLoadMore={handleLoadMore}
            userRefs={nonNullUsers}
            queryRef={query}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedProfileViewSharedFollowersSheet = forwardRef<GalleryBottomSheetModalType, Props>(
  ProfileViewSharedFollowersSheet
);

export { ForwardedProfileViewSharedFollowersSheet as ProfileViewSharedFollowersSheet };
