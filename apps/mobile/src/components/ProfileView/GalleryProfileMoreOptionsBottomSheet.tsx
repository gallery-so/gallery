import { useCallback, useEffect, useMemo, useState } from 'react';
import { Share, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useToastActions } from '~/contexts/ToastContext';
import { GalleryProfileMoreOptionsBottomSheetFragment$key } from '~/generated/GalleryProfileMoreOptionsBottomSheetFragment.graphql';
import { GalleryProfileMoreOptionsBottomSheetQueryFragment$key } from '~/generated/GalleryProfileMoreOptionsBottomSheetQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useBlockUser } from '~/shared/hooks/useBlockUser';
import useFollowUser from '~/shared/relay/useFollowUser';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';

import { BottomSheetRow } from '../BottomSheetRow';
import { BlockUserConfirmationForm } from './BlockUserConfirmationForm';

type Props = {
  queryRef: GalleryProfileMoreOptionsBottomSheetQueryFragment$key;
  userRef: GalleryProfileMoreOptionsBottomSheetFragment$key;
};

export default function GalleryProfileMoreOptionsBottomSheet({ queryRef, userRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryProfileMoreOptionsBottomSheetQueryFragment on Query {
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

  const user = useFragment(
    graphql`
      fragment GalleryProfileMoreOptionsBottomSheetFragment on GalleryUser {
        id
        dbid
        username
      }
    `,
    userRef
  );

  const { pushToast } = useToastActions();
  const blockUser = useBlockUser();
  const handleBlockUser = useCallback(async () => {
    try {
      await blockUser(user.dbid);
    } catch (e: unknown) {
      pushToast({ message: "Failed to block user. We're looking into it." });
      return;
    }
  }, [blockUser, pushToast, user.dbid]);

  const followUser = useFollowUser({ queryRef: query });
  const unfollowUser = useUnfollowUser({ queryRef: query });

  const handleFollowUser = useCallback(() => {
    followUser(user.dbid);
  }, [followUser, user.dbid]);

  const handleUnfollowUser = useCallback(() => {
    unfollowUser(user.dbid);
  }, [unfollowUser, user.dbid]);

  const followingList = query.viewer?.user?.following;

  const isFollowingUser = useMemo(() => {
    if (!followingList) {
      return false;
    }
    const followingIds = new Set(
      followingList.map((following: { id: string } | null) => following?.id)
    );
    return followingIds.has(user.id);
  }, [followingList, user.id]);

  const [showBlockUserForm, setShowBlockUserForm] = useState(false);

  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleDisplayBlockForm = useCallback(async () => {
    await handleBlockUser();
    setShowBlockUserForm(true);
  }, [handleBlockUser]);

  const handleShareProfile = useCallback(() => {
    Share.share({ url: `https://gallery.so/${user.username}` });
  }, [user.username]);

  const options = useMemo(
    () => (
      <>
        <BottomSheetRow
          text={`${isFollowingUser ? 'Unfollow' : 'Follow'} ${user.username}`}
          onPress={isFollowingUser ? handleUnfollowUser : handleFollowUser}
          eventContext={contexts.Posts}
        />
        <BottomSheetRow
          text="Share Profile"
          onPress={handleShareProfile}
          eventContext={contexts.UserGallery}
        />
        <BottomSheetRow
          text={`Block ${user.username}`}
          onPress={handleDisplayBlockForm}
          eventContext={contexts.UserGallery}
          isConfirmationRow
        />
      </>
    ),
    [
      handleDisplayBlockForm,
      handleFollowUser,
      handleShareProfile,
      handleUnfollowUser,
      isFollowingUser,
      user.username,
    ]
  );

  const handleResetState = useCallback(() => {
    setShowBlockUserForm(false);
  }, []);

  useEffect(() => {
    return () => {
      handleResetState();
    };
  }, [handleResetState]);

  return (
    <View className="flex flex-col space-y-6">
      {showBlockUserForm ? (
        <BlockUserConfirmationForm
          userId={user.dbid}
          username={user.username ?? ''}
          onBlockUser={handleBlockUser}
          onDismiss={hideBottomSheetModal}
        />
      ) : (
        <View className="flex flex-col space-y-2">{options}</View>
      )}
    </View>
  );
}
