import { useCallback, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { FollowButtonQueryFragment$key } from '~/generated/FollowButtonQueryFragment.graphql';
import { FollowButtonUserFragment$key } from '~/generated/FollowButtonUserFragment.graphql';
import useFollowUser from '~/shared/relay/useFollowUser';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';

import { Typography } from '../Typography';

type Props = {
  queryRef: FollowButtonQueryFragment$key;
  userRef: FollowButtonUserFragment$key;
};

export function FollowButton({ queryRef, userRef }: Props) {
  const loggedInUserQuery = useFragment(
    graphql`
      fragment FollowButtonQueryFragment on Query {
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

  const userToFollow = useFragment(
    graphql`
      fragment FollowButtonUserFragment on GalleryUser {
        id
        dbid
      }
    `,
    userRef
  );

  const followUser = useFollowUser({ queryRef: loggedInUserQuery });
  const unfollowUser = useUnfollowUser({ queryRef: loggedInUserQuery });

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

  const handlePress = useCallback(async () => {
    if (isFollowing) {
      await unfollowUser(userToFollow.dbid);
    } else {
      await followUser(userToFollow.dbid);
    }
  }, [followUser, isFollowing, unfollowUser, userToFollow.dbid]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`${
        isFollowing
          ? 'bg-faint dark:bg-graphite'
          : 'bg-offBlack dark:border-shadow dark:border dark:bg-black'
      }  rounded py-0.5 px-2`}
    >
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Bold',
        }}
        className={`${
          isFollowing ? 'text-offBlack dark:text-white' : 'text-offWhite dark:text-white'
        } text-center text-sm`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Typography>
    </TouchableOpacity>
  );
}
