import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Share } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { BottomSheetRow } from '~/components/BottomSheetRow';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { PostBottomSheetFragment$key } from '~/generated/PostBottomSheetFragment.graphql';
import { PostBottomSheetQueryFragment$key } from '~/generated/PostBottomSheetQueryFragment.graphql';
import { PostBottomSheetUserFragment$key } from '~/generated/PostBottomSheetUserFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import useFollowUser from '~/shared/relay/useFollowUser';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';

import { DeletePostBottomSheet } from './DeletePostBottomSheet';
import ReportPost from './ReportPost';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  isOwnPost: boolean;
  postRef: PostBottomSheetFragment$key;
  queryRef: PostBottomSheetQueryFragment$key;
  userRef: PostBottomSheetUserFragment$key;
};

function PostBottomSheet(
  { isOwnPost, postRef, queryRef, userRef }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const post = useFragment(
    graphql`
      fragment PostBottomSheetFragment on Post {
        __typename
        dbid
        author {
          username
        }
        tokens {
          dbid
          ...useGetPreviewImagesSingleFragment
        }
        ...DeletePostBottomSheetFragment
      }
    `,
    postRef
  );

  const userToFollow = useFragment(
    graphql`
      fragment PostBottomSheetUserFragment on GalleryUser {
        id
        dbid
      }
    `,
    userRef
  );

  const loggedInUserQuery = useFragment(
    graphql`
      fragment PostBottomSheetQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              following @required(action: THROW) {
                id @required(action: THROW)
              }
            }
          }
        }

        ...useFollowUserFragment
        ...useUnfollowUserFragment
      }
    `,
    queryRef
  );
  const token = post.tokens?.[0] || null;

  if (!token) {
    throw new Error('There is no token in post');
  }

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const deletePostBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const username = post?.author?.username;

  const handleDeletePost = useCallback(() => {
    deletePostBottomSheetRef.current?.present();
  }, []);

  const followingList = loggedInUserQuery.viewer?.user?.following;

  const isFollowing = useMemo(() => {
    if (!followingList) {
      return false;
    }
    const followingIds = new Set(
      followingList.map((following: { id: string } | null) => following?.id)
    );
    return followingIds.has(userToFollow.id);
  }, [followingList, userToFollow.id]);

  const followUser = useFollowUser({ queryRef: loggedInUserQuery });
  const unfollowUser = useUnfollowUser({ queryRef: loggedInUserQuery });

  const handleFollowUser = useCallback(() => {
    if (isFollowing) {
      unfollowUser(userToFollow.dbid);
    } else {
      followUser(userToFollow.dbid);
    }
  }, [followUser, unfollowUser, isFollowing, userToFollow.dbid]);

  const imageUrl = useGetSinglePreviewImage({
    tokenRef: token,
    preferStillFrameFromGif: true,
    size: 'medium',
    // we're simply using the URL for warming the cache;
    // no need to throw an error if image is invalid
    shouldThrow: false,
  });

  const handleViewNftDetail = useCallback(() => {
    navigation.navigate('UniversalNftDetail', {
      cachedPreviewAssetUrl: imageUrl,
      tokenId: token.dbid,
    });
  }, [imageUrl, navigation, token.dbid]);

  const handleShare = useCallback(() => {
    const url = `https://gallery.so/post/${post.dbid}`;
    Share.share({ url });
  }, [post.dbid]);

  const [showReportPostForm, setShowReportPostForm] = useState(false);

  const handleReportPost = useCallback(() => {
    // set state
    setShowReportPostForm(true);
  }, []);

  const handleResetState = useCallback(() => {
    setShowReportPostForm(false);
  }, []);

  const handleDismissBottomSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const inner = useMemo(() => {
    if (isOwnPost) {
      return (
        <>
          <BottomSheetRow text="Share" onPress={handleShare} eventContext={contexts.Posts} />
          <BottomSheetRow
            text="View Item Detail"
            onPress={handleViewNftDetail}
            eventContext={contexts.Posts}
          />
          <BottomSheetRow
            text="Delete"
            isConfirmationRow
            onPress={handleDeletePost}
            eventContext={contexts.Posts}
          />
        </>
      );
    }

    if (isFollowing) {
      return (
        <>
          <BottomSheetRow text="Share" onPress={handleShare} eventContext={contexts.Posts} />
          <BottomSheetRow
            text="View Item Detail"
            onPress={handleViewNftDetail}
            eventContext={contexts.Posts}
          />
          <BottomSheetRow
            text={`Unfollow ${username}`}
            onPress={handleFollowUser}
            eventContext={contexts.Posts}
          />
          <BottomSheetRow
            text="Report Post"
            onPress={handleReportPost}
            eventContext={contexts.Posts}
            isConfirmationRow
          />
        </>
      );
    }

    return (
      <>
        <BottomSheetRow text="Share" onPress={handleShare} eventContext={contexts.Posts} />
        <BottomSheetRow
          text={`Follow ${username}`}
          onPress={handleFollowUser}
          eventContext={contexts.Posts}
        />
        <BottomSheetRow
          text="View Item Detail"
          onPress={handleViewNftDetail}
          eventContext={contexts.Posts}
        />
        <BottomSheetRow
          text="Report Post"
          onPress={handleReportPost}
          eventContext={contexts.Posts}
          isConfirmationRow
        />
      </>
    );
  }, [
    handleDeletePost,
    handleFollowUser,
    handleReportPost,
    handleShare,
    handleViewNftDetail,
    isFollowing,
    isOwnPost,
    username,
  ]);

  return (
    <>
      <GalleryBottomSheetModal
        ref={(value) => {
          bottomSheetRef.current = value;

          if (typeof ref === 'function') {
            ref(value);
          } else if (ref) {
            ref.current = value;
          }
        }}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        onDismiss={handleResetState}
      >
        <View
          onLayout={handleContentLayout}
          style={{ paddingBottom: bottom }}
          className="p-4 flex flex-col space-y-6"
        >
          {showReportPostForm ? (
            <ReportPost postId={post.dbid} onDismiss={handleDismissBottomSheet} />
          ) : (
            <View className="flex flex-col space-y-2">{inner}</View>
          )}
        </View>
      </GalleryBottomSheetModal>

      <DeletePostBottomSheet
        ref={deletePostBottomSheetRef}
        postRef={post}
        onDeleted={handleDismissBottomSheet}
      />
    </>
  );
}

const ForwardedPostBottomSheet = forwardRef(PostBottomSheet);

export { ForwardedPostBottomSheet as PostBottomSheet };
