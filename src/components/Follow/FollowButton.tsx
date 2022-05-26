import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import useFollowUser from './mutations/useFollowUser';
import useUnfollowUser from './mutations/useUnfollowUser';
import Tooltip, { StyledTooltipParent } from 'components/Tooltip/Tooltip';
import IconButton from 'components/IconButton/IconButton';
import { useToastActions } from 'contexts/toast/ToastContext';
import { FollowButtonFragment$key } from '__generated__/FollowButtonFragment.graphql';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type Props = {
  userRef: FollowButtonFragment$key;
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

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const { pushToast } = useToastActions();
  const track = useTrack();

  const handleFollowClick = useCallback(async () => {
    setClickedAndStillHovering(true);
    track('Follow Click', {
      followee: user.dbid,
    });
    const optimisticNewFollowersList = [{ id: loggedInUserId! }, ...user.followers];
    await followUser(user.dbid, optimisticNewFollowersList, user.following);
    pushToast({ message: `You have followed ${user.username}.` });
  }, [loggedInUserId, user, track, followUser, pushToast]);

  const handleUnfollowClick = useCallback(async () => {
    setClickedAndStillHovering(true);
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

  const [isHovering, setIsHovering] = useState(false);
  // Used to prevent hover state/icon from showing when user has just clicked the button.
  // ie When the user clicks follow, we want to immediately show the default Following state, instead of Following's hover state (unfollow)
  const [clickedAndStillHovering, setClickedAndStillHovering] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setIsHovering(false);
    setClickedAndStillHovering(false);
  }, []);

  const tooltipText = useMemo(() => {
    if (!loggedInUserId) {
      return 'Please sign in to follow.';
    }

    if (clickedAndStillHovering) {
      return isFollowing ? 'Follow' : 'Unfollow';
    }
    return isFollowing ? 'Unfollow' : 'Follow';
  }, [clickedAndStillHovering, isFollowing, loggedInUserId]);

  return (
    <StyledTooltipParent
      disabled={isAuthenticatedUsersPage || clickedAndStillHovering}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseExit}
    >
      <IconButton
        onClick={handleClick}
        isFollowing={isFollowing}
        disabled={isFollowActionDisabled}
        isHovering={isHovering}
        clickedAndStillHovering={clickedAndStillHovering}
      />
      <Tooltip text={tooltipText} />
    </StyledTooltipParent>
  );
}

export const TooltipWrapper = styled.div`
  position: relative;
`;
