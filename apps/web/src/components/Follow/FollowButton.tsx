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
        viewer {
          ... on Viewer {
            user {
              dbid
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
        dbid
        username
      }
    `,
    userRef
  );

  const loggedInUserId = useLoggedInUserId(loggedInUserQuery);
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

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const { pushToast } = useToastActions();
  const showAuthModal = useAuthModal('sign-in');
  const track = useTrack();

  const handleFollowClick = useCallback(async () => {
    if (!loggedInUserId || !followingList) {
      showAuthModal();
      return;
    }

    track('Follow Click', {
      followee: userToFollow.dbid,
    });

    const optimisticNewFollowingList = [{ id: userToFollow.dbid }, ...followingList];
    await followUser(loggedInUserId, userToFollow.dbid, optimisticNewFollowingList);
    pushToast({ message: `You followed ${userToFollow.username}.` });
  }, [
    followingList,
    track,
    userToFollow.dbid,
    userToFollow.username,
    followUser,
    loggedInUserId,
    pushToast,
    showAuthModal,
  ]);

  const handleUnfollowClick = useCallback(async () => {
    if (!followingList || !loggedInUserId) {
      return;
    }
    track('Unfollow Click', {
      followee: userToFollow.dbid,
    });
    const optimisticNewFollowingList = followingList.filter(
      (following: { id: string } | null) => following?.id !== userToFollow.dbid
    );
    await unfollowUser(loggedInUserId, userToFollow.dbid, optimisticNewFollowingList);
    pushToast({ message: `You unfollowed ${userToFollow.username}.` });
  }, [
    followingList,
    track,
    userToFollow.dbid,
    userToFollow.username,
    unfollowUser,
    loggedInUserId,
    pushToast,
  ]);

  const isSelf = loggedInUserId === userToFollow?.id;

  const followChip = useMemo(() => {
    if (isSelf) {
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
    }
  }, [className, handleFollowClick, handleUnfollowClick, isSelf, isFollowing]);

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

  @media only screen and ${breakpoints.tablet} {
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
