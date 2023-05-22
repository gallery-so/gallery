import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { UserFollowListFallback } from '~/components/UserFollowList/UserFollowListFallback';
import { UserFollowedUsersFeedEventFollowersFragment$key } from '~/generated/UserFollowedUsersFeedEventFollowersFragment.graphql';
import { UserFollowedUsersFeedEventFollowListQuery } from '~/generated/UserFollowedUsersFeedEventFollowListQuery.graphql';
import { UserFollowedUsersFeedEventFragment$key } from '~/generated/UserFollowedUsersFeedEventFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { getTimeSince } from '~/shared/utils/time';

import { Typography } from '../../Typography';

type UserFollowedUsersFeedEventProps = {
  userFollowedUsersFeedEventDataRef: UserFollowedUsersFeedEventFragment$key;
};

export function UserFollowedUsersFeedEvent({
  userFollowedUsersFeedEventDataRef,
}: UserFollowedUsersFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment UserFollowedUsersFeedEventFragment on UserFollowedUsersFeedEventData {
        __typename
        eventTime

        owner {
          username
        }
        followed {
          user {
            username
            ...UserFollowedUsersFeedEventFollowersFragment
          }
        }
      }
    `,
    userFollowedUsersFeedEventDataRef
  );

  const followedUsers = useMemo(() => {
    return removeNullValues(eventData.followed?.map((followed) => followed?.user));
  }, [eventData.followed]);

  const followerUsername = eventData.owner?.username;
  const followeeUsername = eventData.followed?.[0]?.user?.username;
  const remainingFolloweeCount = eventData.followed?.length ? eventData.followed?.length - 1 : 0;

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleFollowerPress = useCallback(() => {
    if (followerUsername) {
      navigation.push('Profile', { username: followerUsername });
    }
  }, [followerUsername, navigation]);

  const handleFolloweePress = useCallback(() => {
    if (followeeUsername) {
      navigation.push('Profile', { username: followeeUsername });
    }
  }, [followeeUsername, navigation]);

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const [opened, setOpened] = useState(false);
  const handleOthersPress = useCallback(() => {
    setOpened(true);
    bottomSheetRef.current?.present();
  }, []);

  return (
    <View className="flex flex-row justify-between items-center px-3">
      <GalleryBottomSheetModal ref={bottomSheetRef} snapPoints={[320]}>
        <Suspense fallback={<UserFollowListFallback />}>
          {opened && <FollowList userRefs={followedUsers} />}
        </Suspense>
      </GalleryBottomSheetModal>

      <View className="flex flex-row space-x-1">
        <GalleryTouchableOpacity
          onPress={handleFollowerPress}
          eventElementId="Feed Username Button"
          eventName="Feed Username Clicked"
          properties={{ variant: 'Follower' }}
        >
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {followerUsername}
          </Typography>
        </GalleryTouchableOpacity>

        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          followed
        </Typography>

        <GalleryTouchableOpacity
          onPress={handleFolloweePress}
          eventElementId="Feed Username Button"
          eventName="Feed Username Clicked"
          properties={{ variant: 'Followee' }}
        >
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {followeeUsername}
          </Typography>
        </GalleryTouchableOpacity>

        {remainingFolloweeCount && (
          <View className="flex flex-row space-x-1">
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              and
            </Typography>

            <GalleryTouchableOpacity
              onPress={handleOthersPress}
              eventElementId={null}
              eventName={null}
            >
              <Typography
                className="text-sm underline"
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                {remainingFolloweeCount} {remainingFolloweeCount === 1 ? 'other' : 'others'}
              </Typography>
            </GalleryTouchableOpacity>
          </View>
        )}
      </View>

      <View>
        <Typography
          className="text-metal text-xs"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {getTimeSince(eventData.eventTime)}
        </Typography>
      </View>
    </View>
  );
}

type FollowListProps = {
  userRefs: UserFollowedUsersFeedEventFollowersFragment$key;
};

function FollowList({ userRefs }: FollowListProps) {
  const query = useLazyLoadQuery<UserFollowedUsersFeedEventFollowListQuery>(
    graphql`
      query UserFollowedUsersFeedEventFollowListQuery {
        ...UserFollowListQueryFragment
      }
    `,
    {}
  );

  const users = useFragment(
    graphql`
      fragment UserFollowedUsersFeedEventFollowersFragment on GalleryUser @relay(plural: true) {
        ...UserFollowListFragment
      }
    `,
    userRefs
  );

  return <UserFollowList userRefs={users} queryRef={query} onUserPress={() => {}} />;
}
