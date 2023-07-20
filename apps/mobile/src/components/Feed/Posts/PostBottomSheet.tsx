import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { ForwardedRef, forwardRef, useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { PostBottomSheetFragment$key } from '~/generated/PostBottomSheetFragment.graphql';
import { PostBottomSheetQueryFragment$key } from '~/generated/PostBottomSheetQueryFragment.graphql';
import { PostBottomSheetUserFragment$key } from '~/generated/PostBottomSheetUserFragment.graphql';
import useFollowUser from '~/shared/relay/useFollowUser';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';

import { DeletePostBottomSheet } from './DeletePostBottomSheet';

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
        author {
          username
        }
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

  const followUserText = useMemo(() => {
    if (isFollowing) {
      return `Unfollow ${username}`;
    } else {
      return `Follow ${username}`;
    }
  }, [isFollowing, username]);

  const inner = useMemo(() => {
    if (isOwnPost)
      return (
        <>
          <BottomSheetRow text="Share" onPress={() => {}} />
          <BottomSheetRow text="View item detail" onPress={() => {}} />
          <BottomSheetRow text="Delete" isConfirmationRow onPress={handleDeletePost} />
        </>
      );

    return (
      <>
        <BottomSheetRow text="Share" onPress={() => {}} />
        <BottomSheetRow text={followUserText} onPress={handleFollowUser} />
        <BottomSheetRow text="View item detail" onPress={() => {}} />
      </>
    );
  }, [followUserText, handleDeletePost, handleFollowUser, isOwnPost]);

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
      >
        <View
          onLayout={handleContentLayout}
          style={{ paddingBottom: bottom }}
          className="p-4 flex flex-col space-y-6"
        >
          <View className="flex flex-col space-y-2">{inner}</View>
        </View>
      </GalleryBottomSheetModal>

      <DeletePostBottomSheet ref={deletePostBottomSheetRef} />
    </>
  );
}

const ForwardedPostBottomSheet = forwardRef(PostBottomSheet);

export { ForwardedPostBottomSheet as PostBottomSheet };

type BottomSheetRowProps = {
  text: string;
  onPress: () => void;
  style?: React.ComponentProps<typeof GalleryTouchableOpacity>['style'];
  isConfirmationRow?: boolean;
};

function BottomSheetRow({ text, onPress, style, isConfirmationRow }: BottomSheetRowProps) {
  return (
    <GalleryTouchableOpacity onPress={onPress} eventElementId={null} eventName={null} style={style}>
      <View className="bg-offWhite p-3">
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          className={clsx('text-sm', isConfirmationRow ? 'text-red' : 'text-black-900')}
        >
          {text}
        </Typography>
      </View>
    </GalleryTouchableOpacity>
  );
}
