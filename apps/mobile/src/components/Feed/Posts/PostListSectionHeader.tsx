import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { LeafIcon } from 'src/icons/LeafIcon';
import { OptionIcon } from 'src/icons/OptionIcon';
import { TopMemberBadgeIcon } from 'src/icons/TopMemberBadgeIcon';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { PostListSectionHeaderFragment$key } from '~/generated/PostListSectionHeaderFragment.graphql';
import { PostListSectionHeaderQueryFragment$key } from '~/generated/PostListSectionHeaderQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import SharePostBottomSheet from '~/screens/PostScreen/SharePostBottomSheet';
import { contexts } from '~/shared/analytics/constants';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import { getTimeSince } from '~/shared/utils/time';

import FirstTimePosterBottomSheet from './FirstTimePosterBottomSheet';
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
        dbid
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
        tokens {
          definition {
            community {
              id
              creator {
                ... on GalleryUser {
                  username
                }
              }
            }
          }
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
      }
    `,
    queryRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const token = feedPost?.tokens?.[0];
  const loggedInUserId = useLoggedInUserId(query);
  const isOwnPost = loggedInUserId === feedPost.author?.id;

  const activeBadge = useMemo(() => {
    return feedPost.author?.badges?.find((badge) => badge?.name === 'Top Member');
  }, [feedPost.author?.badges]);

  const { showBottomSheetModal } = useBottomSheetModalActions();

  const handleSharePost = useCallback(() => {
    showBottomSheetModal({
      content: (
        // TODO add fallback loading state for Share Bottom Sheet
        <Suspense fallback={null}>
          <SharePostBottomSheet
            title="Share Post"
            postId={feedPost.dbid}
            creatorName={token?.definition?.community?.creator?.username ?? ''}
          />
        </Suspense>
      ),
    });
  }, [feedPost.dbid, showBottomSheetModal, token?.definition?.community?.creator?.username]);

  const handleMenuPress = useCallback(() => {
    showBottomSheetModal({
      content: (
        <PostBottomSheet
          ref={bottomSheetRef}
          isOwnPost={isOwnPost}
          postRef={feedPost}
          queryRef={query}
          userRef={feedPost.author}
          onShare={handleSharePost}
        />
      ),
      navigationContext: navigation,
    });
  }, [feedPost, handleSharePost, isOwnPost, navigation, query, showBottomSheetModal]);

  const handleUsernamePress = useCallback(() => {
    if (feedPost.author?.username) {
      navigation.push('Profile', { username: feedPost.author?.username });
    }
  }, [feedPost.author?.username, navigation]);

  const handleLeafIconPress = useCallback(() => {
    showBottomSheetModal({
      content: <FirstTimePosterBottomSheet />,
    });
  }, [showBottomSheetModal]);

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
                  onPress={handleLeafIconPress}
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
    </View>
  );
}
