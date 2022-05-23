import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import useFollowUser from './mutations/useFollowUser';
import useUnfollowUser from './mutations/useUnfollowUser';
import Tooltip, { StyledTooltipParent } from 'components/Tooltip/Tooltip';
import IconButton from 'components/IconButton/IconButton';

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
      }
    `,
    userRef
  );

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const handleClick = useCallback(() => {
    isFollowing ? unfollowUser(user.dbid) : followUser(user.dbid);
  }, [followUser, isFollowing, unfollowUser, user.dbid]);

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
