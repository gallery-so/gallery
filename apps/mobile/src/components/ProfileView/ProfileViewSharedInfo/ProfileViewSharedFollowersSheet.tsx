import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { ProfileViewSharedFollowersSheetFragment$key } from '~/generated/ProfileViewSharedFollowersSheetFragment.graphql';
import { ProfileViewSharedFollowersSheetQuery } from '~/generated/ProfileViewSharedFollowersSheetQuery.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  userRef: ProfileViewSharedFollowersSheetFragment$key;
};

export default function ProfileViewSharedFollowersSheet(props: Props) {
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

  const screenHeight = Dimensions.get('window').height;

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

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUserPress = useCallback(
    (username: string) => {
      navigation.push('Profile', { username: username });
    },
    [navigation]
  );

  return (
    <View className="flex bg-white dark:bg-black-900">
      <View className={`max-h-[${screenHeight * 0.5}px]`}>
        <Typography
          className="text-sm mb-4"
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
        >
          Followers
        </Typography>

        <View className="flex-grow h-full">
          <UserFollowList
            onUserPress={handleUserPress}
            onLoadMore={handleLoadMore}
            userRefs={nonNullUsers}
            queryRef={query}
          />
        </View>
      </View>
    </View>
  );
}
