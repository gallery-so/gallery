import { useCallback, useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { trigger } from 'react-native-haptic-feedback';
import { graphql, useFragment } from 'react-relay';

import { ButtonChip, ButtonChipVariant } from '~/components/ButtonChip';
import { FollowButtonQueryFragment$key } from '~/generated/FollowButtonQueryFragment.graphql';
import { FollowButtonUserFragment$key } from '~/generated/FollowButtonUserFragment.graphql';
import useFollowUser from '~/shared/relay/useFollowUser';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';

type Props = {
  style?: ViewProps['style'];
  queryRef: FollowButtonQueryFragment$key;
  userRef: FollowButtonUserFragment$key;
  className?: string;
  styleChip?: ViewProps['style'];
  variant?: ButtonChipVariant;
  source?: string; // where the FollowButton is being used, for analytics
  width?: 'fixed' | 'grow';
  onPress?: () => void;
};

export function FollowButton({
  queryRef,
  userRef,
  style,
  styleChip,
  width = 'fixed',
  variant,
  onPress,
}: Props) {
  const loggedInUserQuery = useFragment(
    graphql`
      fragment FollowButtonQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
              following @required(action: THROW) {
                id @required(action: THROW)
              }
              followers @required(action: THROW) {
                id @required(action: THROW)
              }
            }
          }
        }

        ...useLoggedInUserIdFragment
        ...useFollowUserFragment
        ...useUnfollowUserFragment
      }
    `,
    queryRef
  );

  const userToFollow = useFragment(
    graphql`
      fragment FollowButtonUserFragment on GalleryUser {
        id
        dbid
      }
    `,
    userRef
  );

  const loggedInUserId = useLoggedInUserId(loggedInUserQuery);
  const followingList = loggedInUserQuery.viewer?.user?.following;
  const followersList = loggedInUserQuery.viewer?.user?.followers;

  const isFollowing = useMemo(() => {
    if (!followingList) {
      return false;
    }
    const followingIds = new Set(
      followingList.map((following: { id: string } | null) => following?.id)
    );

    return followingIds.has(userToFollow.id);
  }, [followingList, userToFollow.id]);

  const followsYou = useMemo(() => {
    if (!followersList) {
      return false;
    }
    const followerIds = new Set(
      followersList.map((following: { id: string } | null) => following?.id)
    );
    return followerIds.has(userToFollow.id);
  }, [followersList, userToFollow.id]);

  const followUser = useFollowUser({ queryRef: loggedInUserQuery });
  const unfollowUser = useUnfollowUser({ queryRef: loggedInUserQuery });

  const handleFollowPress = useCallback(async () => {
    onPress?.();
    trigger('impactLight');

    await followUser(userToFollow.dbid);
  }, [userToFollow.dbid, followUser, onPress]);

  const handleUnfollowPress = useCallback(async () => {
    trigger('impactLight');

    await unfollowUser(userToFollow.dbid);
  }, [userToFollow.dbid, unfollowUser]);

  const isSelf = loggedInUserId === userToFollow?.id;

  const followChip = useMemo(() => {
    if (isSelf) {
      return null;
    } else if (isFollowing) {
      return (
        <ButtonChip
          variant={variant ? 'secondary' : 'primary'}
          onPress={handleUnfollowPress}
          width={width}
          style={styleChip}
        >
          Following
        </ButtonChip>
      );
    } else {
      return (
        <ButtonChip
          variant={variant ? variant : 'secondary'}
          width={width}
          onPress={handleFollowPress}
          eventProperties={{ followType: followsYou ? 'Follow back' : 'Single follow' }}
          style={styleChip}
        >
          {followsYou ? 'Follow back' : 'Follow'}
        </ButtonChip>
      );
    }
  }, [
    isSelf,
    isFollowing,
    handleUnfollowPress,
    width,
    handleFollowPress,
    followsYou,
    styleChip,
    variant,
  ]);

  return <View style={style}>{followChip}</View>;
}
