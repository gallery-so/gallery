import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useCallback, useMemo, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { InteractiveLink } from '~/components/InteractiveLink';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { ProfileViewSharedFollowersBubblesFragment$key } from '~/generated/ProfileViewSharedFollowersBubblesFragment.graphql';
import { ProfileViewSharedFollowersFollowingTextFragment$key } from '~/generated/ProfileViewSharedFollowersFollowingTextFragment.graphql';
import { ProfileViewSharedFollowersFragment$key } from '~/generated/ProfileViewSharedFollowersFragment.graphql';
import { ProfileViewSharedFollowersQueryFragment$key } from '~/generated/ProfileViewSharedFollowersQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import isFeatureEnabled, { FeatureFlag } from '../../../utils/isFeatureEnabled';
import { ProfileViewSharedFollowersSheet } from './ProfileViewSharedFollowersSheet';

export const SHARED_FOLLOWERS_PER_PAGE = 20;

type Props = {
  queryRef: ProfileViewSharedFollowersQueryFragment$key;
  userRef: ProfileViewSharedFollowersFragment$key;
};

export default function ProfileViewSharedFollowers({ userRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ProfileViewSharedFollowersQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

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

  const isPfpEnabled = isFeatureEnabled(FeatureFlag.PFP, query);

  const sharedFollowers = useMemo(() => {
    const list = user.sharedFollowers?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [user.sharedFollowers?.edges]);

  const totalSharedFollowers = user.sharedFollowers?.pageInfo?.total ?? 0;
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleSeeAllPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  if (totalSharedFollowers === 0) {
    return null;
  }

  return (
    <View className="flex flex-row flex-wrap space-x-1">
      {isPfpEnabled && (
        <ProfilePictureBubblesWithCount
          onPress={handleSeeAllPress}
          totalCount={sharedFollowers.length}
          eventElementId="Shared Followers Bubbles"
          eventName="Shared Followers Bubbles pressed"
          userRefs={sharedFollowers}
        />
      )}

      <FollowingText onSeeAll={handleSeeAllPress} userRefs={sharedFollowers} />

      <ProfileViewSharedFollowersSheet ref={bottomSheetRef} userRef={user} />
    </View>
  );
}

type FollowingTextProps = {
  onSeeAll: () => void;
  style?: ViewProps['style'];
  userRefs: ProfileViewSharedFollowersFollowingTextFragment$key;
};

function FollowingText({ userRefs, onSeeAll, style }: FollowingTextProps) {
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

  return (
    <View className="flex flex-row items-center space-x-1" style={style}>
      <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        Followed by
      </Typography>
      {usersToShow.map((user, index) => {
        const isLast = index === usersToShow.length - 1;

        return (
          <View key={user.dbid} className="flex flex-row">
            <InteractiveLink
              onPress={() => {
                if (user.username) {
                  navigation.push('Profile', { username: user.username });
                }
              }}
              textStyle={{ fontSize: 12 }}
              showUnderline
              type="Shared Followers Username"
            >
              {user.username}
            </InteractiveLink>
            {(!isLast || hasMore) && (
              <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                ,
              </Typography>
            )}
          </View>
        );
      })}

      {hasMore && (
        <View className="flex flex-row">
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            and{' '}
          </Typography>

          <InteractiveLink
            onPress={onSeeAll}
            textStyle={{ fontSize: 12 }}
            type="Shared Followers See All"
            showUnderline
          >
            {users.length - usersToShow.length} others
          </InteractiveLink>
        </View>
      )}
    </View>
  );
}

type ProfilePictureBubblesWithCountProps = {
  userRefs: ProfileViewSharedFollowersBubblesFragment$key;
  totalCount: number;
  onPress: () => void;
} & GalleryElementTrackingProps;

export function ProfilePictureBubblesWithCount({
  onPress,
  userRefs,
  totalCount,
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
            <ProfilePicture userRef={user} size="sm" hasInset={users.length > 1} />
          </View>
        );
      })}

      {Boolean(remainingCount) && (
        <View className="bg-porcelain border-2 border-white dark:border-black-900 rounded-3xl px-1.5 -ml-2">
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
