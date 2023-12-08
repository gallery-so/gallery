import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { LeafIcon } from 'src/icons/LeafIcon';
import { OptionIcon } from 'src/icons/OptionIcon';
import { TopMemberBadgeIcon } from 'src/icons/TopMemberBadgeIcon';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { PostListSectionHeaderFragment$key } from '~/generated/PostListSectionHeaderFragment.graphql';
import { PostListSectionHeaderQueryFragment$key } from '~/generated/PostListSectionHeaderQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import { getTimeSince } from '~/shared/utils/time';

import { FirstTimePosterBottomSheet } from './FirstTimePosterBottomSheet';
import { PostBottomSheet } from './PostBottomSheet';

type PostListSectionHeaderProps = {
  feedPostRef: PostListSectionHeaderFragment$key;
  queryRef: PostListSectionHeaderQueryFragment$key;
};

export function PostListSectionHeader({ feedPostRef, queryRef }: PostListSectionHeaderProps) {
  const feedPost = useFragment(
    graphql`
      fragment PostListSectionHeaderFragment on Post {
        __typename
        isFirstPost
        author @required(action: THROW) {
          __typename
          id
          username
          badges {
            __typename
            name
          }
          ...ProfilePictureFragment
          ...PostBottomSheetUserFragment
        }
        creationTime
        ...PostBottomSheetFragment
      }
    `,
    feedPostRef
  );

  const query = useFragment(
    graphql`
      fragment PostListSectionHeaderQueryFragment on Query {
        ...useLoggedInUserIdFragment
        ...PostBottomSheetQueryFragment
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const firstTimePosterBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const loggedInUserId = useLoggedInUserId(query);
  const isOwnPost = loggedInUserId === feedPost.author?.id;

  const isActivityBadgeEnabled = isFeatureEnabled(FeatureFlag.ACTIVITY_BADGE, query);
  const activeBadge = useMemo(() => {
    if (!isActivityBadgeEnabled) return null;
    return feedPost.author?.badges?.find((badge) => badge?.name === 'Top Member');
  }, [feedPost.author?.badges, isActivityBadgeEnabled]);

  const handleMenuPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleUsernamePress = useCallback(() => {
    if (feedPost.author?.username) {
      navigation.push('Profile', { username: feedPost.author?.username });
    }
  }, [feedPost.author?.username, navigation]);

  return (
    <View className="flex flex-row items-center justify-between bg-white dark:bg-black-900  px-4">
      <View className="flex flex-row  items-center justify-between py-3">
        <View className="flex-1 flex-row items-center space-x-1.5">
          <GalleryTouchableOpacity
            className="flex flex-row items-center space-x-1"
            onPress={handleUsernamePress}
            eventElementId="Feed Profile Picture Button"
            eventName="Feed Profile Picture Clicked"
            eventContext={contexts.Posts}
            properties={{ variant: 'Feed event author' }}
          >
            <ProfilePicture userRef={feedPost.author} size="md" />
          </GalleryTouchableOpacity>
          <View className="flex-1">
            <GalleryTouchableOpacity
              className="flex flex-row items-center"
              onPress={handleUsernamePress}
              eventElementId="Feed Username Button"
              eventName="Feed Username Clicked"
              eventContext={contexts.Posts}
              properties={{ variant: 'Feed event author' }}
            >
              <Typography className="text-sm pr-1" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                {feedPost?.author?.username}
              </Typography>
              {activeBadge && <TopMemberBadgeIcon />}
              {feedPost.isFirstPost && (
                <GalleryTouchableOpacity
                  className="flex"
                  onPress={() => firstTimePosterBottomSheetRef.current?.present()}
                  eventElementId="First Time Poster Leaf Icon Button"
                  eventName="First Time Poster Leaf Icon Button Clicked"
                  eventContext={contexts.Posts}
                >
                  <LeafIcon />
                </GalleryTouchableOpacity>
              )}
            </GalleryTouchableOpacity>
          </View>
        </View>

        <View className="flex flex-row space-x-1.5">
          <Typography
            className="text-xs text-metal"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {getTimeSince(feedPost.creationTime)}
          </Typography>
          <GalleryTouchableOpacity
            onPress={handleMenuPress}
            eventElementId="Open Menu Button"
            eventName="Open Menu Button Press"
            eventContext={contexts.Posts}
          >
            <OptionIcon />
          </GalleryTouchableOpacity>
        </View>
      </View>

      <FirstTimePosterBottomSheet ref={firstTimePosterBottomSheetRef} />
      <PostBottomSheet
        ref={bottomSheetRef}
        isOwnPost={isOwnPost}
        postRef={feedPost}
        queryRef={query}
        userRef={feedPost.author}
      />
    </View>
  );
}
