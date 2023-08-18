import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { OptionIcon } from 'src/icons/OptionIcon';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { PostListSectionHeaderFragment$key } from '~/generated/PostListSectionHeaderFragment.graphql';
import { PostListSectionHeaderQueryFragment$key } from '~/generated/PostListSectionHeaderQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import { getTimeSince } from '~/shared/utils/time';

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
        author @required(action: THROW) {
          __typename
          id
          username
          ...ProfilePictureFragment
          ...PostBottomSheetUserFragment
        }
        creationTime
        tokens {
          __typename
          community {
            name
            contractAddress {
              address
              chain
            }
          }
        }
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
      }
    `,
    queryRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const loggedInUserId = useLoggedInUserId(query);
  const isOwnPost = loggedInUserId === feedPost.author?.id;

  const nonNullTokens = useMemo(() => {
    const tokens = feedPost?.tokens;

    return removeNullValues(tokens);
  }, [feedPost?.tokens]);

  const community = nonNullTokens[0]?.community ?? {
    dbid: null,
    name: 'Unknown Community',
    contractAddress: null,
  };

  const handleMenuPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleUsernamePress = useCallback(() => {
    if (feedPost.author?.username) {
      navigation.push('Profile', { username: feedPost.author?.username });
    }
  }, [feedPost.author?.username, navigation]);

  const handleCommunityPress = useCallback(() => {
    if (!community.contractAddress) return;
    navigation.push('Community', {
      contractAddress: community.contractAddress?.address ?? '',
      chain: community.contractAddress?.chain ?? '',
    });
  }, [community.contractAddress, navigation]);

  return (
    <View className="flex flex-row items-center justify-between bg-white dark:bg-black-900  px-4">
      <View className="flex flex-row  items-center justify-between py-3">
        <View className="flex-1 flex-row items-center space-x-1.5">
          <GalleryTouchableOpacity
            className="flex flex-row items-center space-x-1"
            onPress={handleUsernamePress}
            eventElementId="Feed Profile Picture Button"
            eventName="Feed Profile Picture Clicked"
            properties={{ variant: 'Feed event author' }}
          >
            <ProfilePicture userRef={feedPost.author} size="md" />
          </GalleryTouchableOpacity>
          <View className="flex-1">
            <GalleryTouchableOpacity
              className="flex flex-row items-center space-x-1"
              onPress={handleUsernamePress}
              eventElementId="Feed Username Button"
              eventName="Feed Username Clicked"
              properties={{ variant: 'Feed event author' }}
            >
              <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
                {feedPost?.author?.username}
              </Typography>
            </GalleryTouchableOpacity>
            {community.name && (
              <GalleryTouchableOpacity
                className="flex flex-row items-center space-x-1"
                onPress={handleCommunityPress}
                eventElementId="Feed Community Button"
                eventName="Feed Community Clicked"
                properties={{ variant: 'Feed event community' }}
              >
                <Typography
                  className="text-xs text-shadow"
                  font={{ family: 'ABCDiatype', weight: 'Regular' }}
                >
                  {community.name}
                </Typography>
              </GalleryTouchableOpacity>
            )}
          </View>
        </View>

        <View className="flex flex-row space-x-1.5">
          <Typography
            className="text-xs text-metal"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {getTimeSince(feedPost.creationTime)}
          </Typography>
          <GalleryTouchableOpacity onPress={handleMenuPress} eventElementId={null} eventName={null}>
            <OptionIcon />
          </GalleryTouchableOpacity>
        </View>
      </View>

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
