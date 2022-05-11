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
  disabled: boolean;
};

export default function FollowButton({ userRef, isFollowing, disabled }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowButtonFragment on GalleryUser {
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

  const tooltipText = useMemo(() => (isFollowing ? 'Unfollow' : 'Follow'), [isFollowing]);

  return (
    <StyledTooltipParent disabled={disabled}>
      <IconButton onClick={handleClick} isFollowing={isFollowing} disabled={disabled} />
      <Tooltip text={tooltipText} />
    </StyledTooltipParent>
  );
}

export const TooltipWrapper = styled.div`
  position: relative;
`;
