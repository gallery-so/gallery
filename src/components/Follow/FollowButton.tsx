import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import useFollowUser from './mutations/useFollowUser';
import useUnfollowUser from './mutations/useUnfollowUser';
import IconButton from 'components/IconButton/IconButton';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { FollowButtonUserFragment$key } from '__generated__/FollowButtonUserFragment.graphql';
import { FollowButtonQueryFragment$key } from '__generated__/FollowButtonQueryFragment.graphql';

type Props = {
  queryRef: FollowButtonQueryFragment$key;
  userRef: FollowButtonUserFragment$key;
};

export default function FollowButton({ queryRef, userRef }: Props) {
  const loggedInUserQuery = useFragment(
    graphql`
      fragment FollowButtonQueryFragment on Query {
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment FollowButtonUserFragment on GalleryUser {
        id
        dbid
        username
        followers @required(action: THROW) {
          id @required(action: THROW)
        }
        following @required(action: THROW) {
          id @required(action: THROW)
        }
      }
    `,
    userRef
  );

  const loggedInUserId = useLoggedInUserId(loggedInUserQuery);

  const followerIds = useMemo(
    () => user.followers.map((follower: { id: string } | null) => follower?.id),
    [user.followers]
  );

  const isFollowing = useMemo(
    () => !!loggedInUserId && followerIds.indexOf(loggedInUserId) > -1,
    [followerIds, loggedInUserId]
  );

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const { pushToast } = useToastActions();
  const track = useTrack();

  const handleFollowClick = useCallback(async () => {
    track('Follow Click', {
      followee: user.dbid,
    });

    if (!loggedInUserId) {
      return;
    }

    const optimisticNewFollowersList = [{ id: loggedInUserId }, ...user.followers];
    await followUser(user.dbid, optimisticNewFollowersList, user.following);
    pushToast({ message: `You have followed ${user.username}.` });
  }, [loggedInUserId, user, track, followUser, pushToast]);

  const handleUnfollowClick = useCallback(async () => {
    track('Unfollow Click', {
      followee: user.dbid,
    });
    const optimisticNewFollowersList = user.followers.filter(
      (follower: { id: string } | null) => follower?.id !== loggedInUserId
    );
    await unfollowUser(user.dbid, optimisticNewFollowersList, user.following);
    pushToast({ message: `You have unfollowed ${user.username}.` });
  }, [user, track, unfollowUser, pushToast, loggedInUserId]);

  const handleClick = isFollowing ? handleUnfollowClick : handleFollowClick;

  const isAuthenticatedUsersPage = loggedInUserId === user?.id;
  const isFollowActionDisabled = isAuthenticatedUsersPage || !loggedInUserId;

  return (
    <IconButton
      onClick={handleClick}
      isFollowing={isFollowing}
      disabled={isFollowActionDisabled}
      isSignedIn={!!loggedInUserId}
      isAuthenticatedUsersPage={isAuthenticatedUsersPage}
    />
  );
}

export const TooltipWrapper = styled.div`
  position: relative;
`;
