import { useNavigation } from '@react-navigation/native';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { BottomSheetRow } from '~/components/BottomSheetRow';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { PostBottomSheetFragment$key } from '~/generated/PostBottomSheetFragment.graphql';
import { PostBottomSheetQueryFragment$key } from '~/generated/PostBottomSheetQueryFragment.graphql';
import { PostBottomSheetUserFragment$key } from '~/generated/PostBottomSheetUserFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import useFollowUser from '~/shared/relay/useFollowUser';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';

import DeletePostBottomSheet from './DeletePostBottomSheet';
import ReportPost from './ReportPost';

type Props = {
  isOwnPost: boolean;
  postRef: PostBottomSheetFragment$key;
  queryRef: PostBottomSheetQueryFragment$key;
  userRef: PostBottomSheetUserFragment$key;
  onShare: () => void;
};

function PostBottomSheet({ isOwnPost, postRef, queryRef, userRef, onShare }: Props) {
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

  const username = post?.author?.username;
  const { showBottomSheetModal } = useBottomSheetModalActions();

  const handleDeletePost = useCallback(() => {
    showBottomSheetModal({
      content: <DeletePostBottomSheet postRef={post} />,
    });
  }, [post, showBottomSheetModal]);

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

  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleShare = useCallback(() => {
    hideBottomSheetModal();
    onShare();
  }, [hideBottomSheetModal, onShare]);

  const [showReportPostForm, setShowReportPostForm] = useState(false);

  const handleReportPost = useCallback(() => {
    setShowReportPostForm(true);
  }, []);

  const handleResetState = useCallback(() => {
    setShowReportPostForm(false);
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

  useEffect(() => {
    return () => {
      handleResetState();
    };
  }, [handleResetState]);

  return (
    <>
      <View className="flex flex-col space-y-6">
        {showReportPostForm ? (
          <ReportPost postId={post.dbid} onDismiss={hideBottomSheetModal} />
        ) : (
          <View className="flex flex-col space-y-2">{inner}</View>
        )}
      </View>
    </>
  );
}

const ForwardedPostBottomSheet = forwardRef(PostBottomSheet);

export { ForwardedPostBottomSheet as PostBottomSheet };
