import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryLink } from '~/components/GalleryLink';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { RawProfilePictureProps } from '~/components/ProfilePicture/RawProfilePicture';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { ProfileViewSharedFollowersBubblesFragment$key } from '~/generated/ProfileViewSharedFollowersBubblesFragment.graphql';
import { ProfileViewSharedFollowersFollowingTextFragment$key } from '~/generated/ProfileViewSharedFollowersFollowingTextFragment.graphql';
import { ProfileViewSharedFollowersFragment$key } from '~/generated/ProfileViewSharedFollowersFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import ProfileViewSharedFollowersSheet from './ProfileViewSharedFollowersSheet';
export const SHARED_FOLLOWERS_PER_PAGE = 20;

type Props = {
  userRef: ProfileViewSharedFollowersFragment$key;
};

export default function ProfileViewSharedFollowers({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewSharedFollowersFragment on GalleryUser {
        __typename
        sharedFollowers(first: $sharedFollowersFirst, after: $sharedFollowersAfter)
          @connection(key: "UserSharedInfoFragment_sharedFollowers") {
          edges {
            node {
              __typename
              ... on GalleryUser {
                __typename
                ...ProfileViewSharedFollowersBubblesFragment
                ...ProfileViewSharedFollowersFollowingTextFragment
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...ProfileViewSharedFollowersSheetFragment
      }
    `,
    userRef
  );

  const sharedFollowers = useMemo(() => {
    const list = user.sharedFollowers?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [user.sharedFollowers?.edges]);

  const totalSharedFollowers = user.sharedFollowers?.pageInfo?.total ?? 0;

  const { showBottomSheetModal } = useBottomSheetModalActions();
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleSeeAllPress = useCallback(() => {
    showBottomSheetModal({
      content: <ProfileViewSharedFollowersSheet userRef={user} />,
      navigationContext: navigation,
    });
  }, [navigation, showBottomSheetModal, user]);

  if (totalSharedFollowers === 0) {
    return null;
  }

  return (
    <View className="flex flex-row flex-wrap space-x-1">
      <ProfilePictureBubblesWithCount
        onPress={handleSeeAllPress}
        totalCount={totalSharedFollowers}
        eventElementId="Shared Followers Bubbles"
        eventName="Shared Followers Bubbles pressed"
        eventContext={contexts.Social}
        userRefs={sharedFollowers}
      />

      <FollowingText
        onSeeAll={handleSeeAllPress}
        userRefs={sharedFollowers}
        totalCount={totalSharedFollowers}
      />
    </View>
  );
}

type FollowingTextProps = {
  onSeeAll: () => void;
  style?: ViewProps['style'];
  userRefs: ProfileViewSharedFollowersFollowingTextFragment$key;
  totalCount: number;
};

function FollowingText({ userRefs, onSeeAll, style, totalCount }: FollowingTextProps) {
  const users = useFragment(
    graphql`
      fragment ProfileViewSharedFollowersFollowingTextFragment on GalleryUser @relay(plural: true) {
        __typename
        dbid
        username
      }
    `,
    userRefs
  );

  const { users: usersToShow, hasMore } = useMemo(() => {
    if (users.length <= 3) {
      return { users: users.slice(0, 3), hasMore: false };
    } else {
      return { users: users.slice(0, 2), hasMore: true };
    }
  }, [users]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const { colorScheme } = useColorScheme();
  return (
    <View className="flex flex-row items-center space-x-1" style={style}>
      <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        Followed by
      </Typography>
      {usersToShow.map((user, index) => {
        const isLast = index === usersToShow.length - 1;

        return (
          <View key={user.dbid} className="flex flex-row">
            <GalleryLink
              onPress={() => {
                if (user.username) {
                  navigation.push('Profile', { username: user.username });
                }
              }}
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              textStyle={{
                fontSize: 12,
                color: colorScheme === 'dark' ? colors.white : colors.black['800'],
              }}
              eventElementId="Shared Followers Username"
              eventName="Shared Followers Username Press"
              eventContext={contexts.Social}
            >
              {user.username}
            </GalleryLink>
            {(!isLast || hasMore) && (
              <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                ,
              </Typography>
            )}
          </View>
        );
      })}

      {hasMore && (
        <View className="flex flex-row">
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            and{' '}
          </Typography>

          <GalleryLink
            onPress={onSeeAll}
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
            textStyle={{
              fontSize: 12,
              color: colorScheme === 'dark' ? colors.white : colors.black['800'],
            }}
            eventElementId="Shared Followers See All"
            eventName="Shared Followers See All Press"
            eventContext={contexts.Social}
          >
            {totalCount - usersToShow.length} others
          </GalleryLink>
        </View>
      )}
    </View>
  );
}

type ProfilePictureBubblesWithCountProps = {
  userRefs: ProfileViewSharedFollowersBubblesFragment$key;
  totalCount: number;
  onPress: () => void;
} & GalleryElementTrackingProps &
  Partial<Pick<RawProfilePictureProps, 'size'>>;

export function ProfilePictureBubblesWithCount({
  onPress,
  userRefs,
  totalCount,
  size = 'sm',
  ...trackingProps
}: ProfilePictureBubblesWithCountProps) {
  const users = useFragment(
    graphql`
      fragment ProfileViewSharedFollowersBubblesFragment on GalleryUser @relay(plural: true) {
        dbid
        ...ProfilePictureFragment
      }
    `,
    userRefs
  );

  if (users.length === 0) {
    return null;
  }

  const remainingCount = Math.max(totalCount - 3, 0);

  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      className="flex flex-row items-center"
      {...trackingProps}
    >
      {users.slice(0, 3).map((user, index) => {
        return (
          <View
            key={user.dbid}
            className={clsx({
              '-ml-2': index !== 0,
            })}
          >
            <ProfilePicture userRef={user} size={size} hasInset={users.length > 1} />
          </View>
        );
      })}

      {Boolean(remainingCount) && (
        <View className="bg-porcelain dark:bg-black-500 border-2 border-white dark:border-black-900 rounded-3xl px-1.5 -ml-2">
          <Typography
            className="text-xs text-metal"
            font={{ family: 'ABCDiatype', weight: 'Medium' }}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            +{remainingCount}
          </Typography>
        </View>
      )}
    </GalleryTouchableOpacity>
  );
}
