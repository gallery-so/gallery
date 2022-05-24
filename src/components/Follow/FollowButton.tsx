import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import useFollowUser from './mutations/useFollowUser';
import useUnfollowUser from './mutations/useUnfollowUser';
import Tooltip, { StyledTooltipParent } from 'components/Tooltip/Tooltip';
import IconButton from 'components/IconButton/IconButton';
import { useToastActions } from 'contexts/toast/ToastContext';

type Props = {
  userRef: any;
  isFollowing: boolean;
  loggedInUserId?: string;
};

export default function FollowButton({ userRef, isFollowing, loggedInUserId }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowButtonFragment on GalleryUser {
        id
        dbid
        username
        followers {
          id
        }
        following {
          id
        }
      }
    `,
    userRef
  );

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const { pushToast } = useToastActions();

  const handleFollowClick = useCallback(() => {
    const optimisticNewFollowersList = [{ id: loggedInUserId }, ...user.followers];
    followUser(user.dbid, optimisticNewFollowersList, user.following).then(() =>
      pushToast({ message: `You have followed ${user.username}.` })
    );
  }, [followUser, pushToast, loggedInUserId, user]);

  const handleUnfollowClick = useCallback(() => {
    const optimisticNewFollowersList = user.followers.filter(
      (follower: { id: string }) => follower.id !== loggedInUserId
    );
    unfollowUser(user.dbid, optimisticNewFollowersList, user.following).then(() =>
      pushToast({ message: `You have unfollowed ${user.username}.` })
    );
  }, [unfollowUser, pushToast, loggedInUserId, user]);

  const handleClick = useCallback(() => {
    isFollowing ? handleUnfollowClick() : handleFollowClick();
  }, [handleFollowClick, handleUnfollowClick, isFollowing]);

  const isAuthenticatedUsersPage = loggedInUserId === user?.id;
  const isFollowActionDisabled = useMemo(
    () => isAuthenticatedUsersPage || !loggedInUserId,
    [isAuthenticatedUsersPage, loggedInUserId]
  );

  const tooltipText = useMemo(() => {
    if (!loggedInUserId) {
      return 'Please sign in to follow.';
    }
    return isFollowing ? 'Unfollow' : 'Follow';
  }, [isFollowing, loggedInUserId]);

  return (
    <StyledTooltipParent disabled={isAuthenticatedUsersPage}>
      <IconButton
        onClick={handleClick}
        isFollowing={isFollowing}
        disabled={isFollowActionDisabled}
      />
      <Tooltip text={tooltipText} />
    </StyledTooltipParent>
  );
}

export const TooltipWrapper = styled.div`
  position: relative;
`;
