import { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { FollowButtonQueryFragment$key } from '~/generated/FollowButtonQueryFragment.graphql';
import { FollowButtonUserFragment$key } from '~/generated/FollowButtonUserFragment.graphql';

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
      }
    `,
    queryRef
  );

  const userToFollow = useFragment(
    graphql`
      fragment FollowButtonUserFragment on GalleryUser {
        id
      }
    `,
    userRef
  );

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

  return (
    <TouchableOpacity onPress={() => {}} className="bg-offBlack rounded py-1">
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Bold',
        }}
        className="text-center text-xs text-white"
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Typography>
    </TouchableOpacity>
  );
}
