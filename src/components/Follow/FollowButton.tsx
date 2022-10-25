import { MouseEventHandler, useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';
import useFollowUser from './mutations/useFollowUser';
import useUnfollowUser from './mutations/useUnfollowUser';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { FollowButtonUserFragment$key } from '__generated__/FollowButtonUserFragment.graphql';
import { FollowButtonQueryFragment$key } from '__generated__/FollowButtonQueryFragment.graphql';
import { TitleXSBold } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { HStack } from 'components/core/Spacer/Stack';
import breakpoints from 'components/core/breakpoints';

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
    () => new Set(user.followers.map((follower: { id: string } | null) => follower?.id)),
    [user.followers]
  );

  const followingIds = useMemo(
    () => new Set(user.following.map((follower: { id: string } | null) => follower?.id)),
    [user.following]
  );

  const isFollowing = useMemo(
    () => !!loggedInUserId && followerIds.has(loggedInUserId),
    [followerIds, loggedInUserId]
  );

  const isUserFollowingLoggedInuser = useMemo(() => {
    if (!loggedInUserId) {
      return false;
    }

    return followingIds.has(loggedInUserId);
  }, [followingIds, loggedInUserId]);

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

  const isAuthenticatedUsersPage = loggedInUserId === user?.id;

  const followChip = useMemo(() => {
    if (isAuthenticatedUsersPage) {
      return null;
    } else if (isFollowing) {
      return (
        // return following & hover show unfollow
        <FollowingChipContainer>
          <FollowingChip>Following</FollowingChip>

          <UnfollowChipContainer>
            <UnfollowChip onClick={handleUnfollowClick}>Unfollow</UnfollowChip>
          </UnfollowChipContainer>
        </FollowingChipContainer>
      );
    } else {
      return <FollowChip onClick={handleFollowClick}>Follow</FollowChip>;
      // show follow button
    }
  }, [handleFollowClick, handleUnfollowClick, isAuthenticatedUsersPage, isFollowing]);

  const handleWrapperClick = useCallback<MouseEventHandler>((event) => {
    // We want to make sure clicking these buttons doesn't bubble up to
    // to prevent any surrounding links from triggering
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <HStack gap={4} onClick={handleWrapperClick}>
      {followChip}
      {isUserFollowingLoggedInuser ? <FollowsYouChip disabled>Follows You</FollowsYouChip> : null}
    </HStack>
  );
}

const Chip = styled(TitleXSBold).attrs({ role: 'button' })<{ disabled?: boolean }>`
  padding: 2px 4px;
  cursor: pointer;

  border-radius: 2px;

  ${({ disabled }) =>
    disabled
      ? css`
          pointer-events: none;
          cursor: default;
        `
      : null};
`;

const FollowingChip = styled(Chip)`
  background-color: ${colors.offBlack};
  color: ${colors.offWhite};
`;

const UnfollowChipContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
`;

const FollowingChipContainer = styled.div`
  position: relative;

  ${UnfollowChipContainer} {
    opacity: 0;
  }

  :hover {
    ${FollowingChip} {
      opacity: 0;
    }

    ${UnfollowChipContainer} {
      opacity: 1;
    }
  }
`;

const FollowChip = styled(Chip)`
  background-color: ${colors.offBlack};
  color: ${colors.offWhite};
`;

const UnfollowChip = styled(Chip)`
  background-color: ${colors.offWhite};

  color: #c72905;
  border: 1px solid #c72905;
`;

const FollowsYouChip = styled(Chip)`
  background-color: ${colors.faint};
  color: ${colors.metal};

  display: none;
  @media only screen and ${breakpoints.tablet} {
    display: flex;
  }
`;
