import { MouseEventHandler, useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';

import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleXSBold } from '~/components/core/Text/Text';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { FollowButtonQueryFragment$key } from '~/generated/FollowButtonQueryFragment.graphql';
import { FollowButtonUserFragment$key } from '~/generated/FollowButtonUserFragment.graphql';
import useAuthModal from '~/hooks/useAuthModal';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';

import breakpoints from '../core/breakpoints';
import useFollowUser from './mutations/useFollowUser';
import useUnfollowUser from './mutations/useUnfollowUser';

type Props = {
  queryRef: FollowButtonQueryFragment$key;
  userRef: FollowButtonUserFragment$key;
  className?: string;
};

export default function FollowButton({ queryRef, userRef, className }: Props) {
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
        following @required(action: THROW) {
          id @required(action: THROW)
        }
        followers @required(action: THROW) {
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

  const isFollowing = useMemo(
    () => !!loggedInUserId && followerIds.has(loggedInUserId),
    [followerIds, loggedInUserId]
  );

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const { pushToast } = useToastActions();
  const showAuthModal = useAuthModal('signIn');
  const track = useTrack();

  const handleFollowClick = useCallback(async () => {
    if (!loggedInUserId) {
      showAuthModal();
      return;
    }

    track('Follow Click', {
      followee: user.dbid,
    });

    const optimisticNewFollowersList = [{ id: loggedInUserId }, ...user.followers];
    await followUser(user.dbid, optimisticNewFollowersList, user.following);
    pushToast({ message: `You followed ${user.username}.` });
  }, [loggedInUserId, user, track, followUser, pushToast, showAuthModal]);

  const handleUnfollowClick = useCallback(async () => {
    track('Unfollow Click', {
      followee: user.dbid,
    });
    const optimisticNewFollowersList = user.followers.filter(
      (follower: { id: string } | null) => follower?.id !== loggedInUserId
    );
    await unfollowUser(user.dbid, optimisticNewFollowersList, user.following);
    pushToast({ message: `You unfollowed ${user.username}.` });
  }, [user, track, unfollowUser, pushToast, loggedInUserId]);

  const isAuthenticatedUsersPage = loggedInUserId === user?.id;

  const followChip = useMemo(() => {
    if (isAuthenticatedUsersPage) {
      return null;
    } else if (isFollowing) {
      return (
        // return following & hover show unfollow
        <FollowingChipContainer>
          <FollowingChip className={className}>Following</FollowingChip>

          <UnfollowChipContainer>
            <UnfollowChip onClick={handleUnfollowClick} className={className}>
              Unfollow
            </UnfollowChip>
          </UnfollowChipContainer>
        </FollowingChipContainer>
      );
    } else {
      return (
        <FollowChip onClick={handleFollowClick} className={className}>
          Follow
        </FollowChip>
      );
      // show follow button
    }
  }, [className, handleFollowClick, handleUnfollowClick, isAuthenticatedUsersPage, isFollowing]);

  const handleWrapperClick = useCallback<MouseEventHandler>((event) => {
    // We want to make sure clicking these buttons doesn't bubble up to
    // to prevent any surrounding links from triggering
    event.preventDefault();
    event.stopPropagation();
  }, []);

  if (!followChip) {
    return null;
  }

  return (
    <HStack gap={4} onClick={handleWrapperClick}>
      {followChip}
    </HStack>
  );
}

const Chip = styled(TitleXSBold).attrs({ role: 'button' })<{ disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 2px 4px;
  cursor: pointer;

  height: 20px;
  line-height: 1;

  border-radius: 2px;

  white-space: nowrap;

  ${({ disabled }) =>
    disabled
      ? css`
          pointer-events: none;
          cursor: default;
        `
      : null};
`;

const FollowingChip = styled(Chip)`
  background-color: ${colors.faint};
  color: ${colors.offBlack};
`;

const UnfollowChipContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
`;

const FollowingChipContainer = styled.div`
  position: relative;
  width: 100%;

  ${UnfollowChipContainer} {
    opacity: 0;
  }

  @media only screen and ${breakpoints.desktop} {
    :hover {
      ${FollowingChip} {
        opacity: 0;
      }

      ${UnfollowChipContainer} {
        opacity: 1;
      }
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
