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
import useFollowUser from '~/shared/relay/useFollowUser';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';

import breakpoints from '../core/breakpoints';

type Props = {
  queryRef: FollowButtonQueryFragment$key;
  userRef: FollowButtonUserFragment$key;
  className?: string;
  source?: string; // where the FollowButton is being used, for analytics
};

export default function FollowButton({ queryRef, userRef, className, source }: Props) {
  const loggedInUserQuery = useFragment(
    graphql`
      fragment FollowButtonQueryFragment on Query {
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

        ...useLoggedInUserIdFragment
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

  const followUser = useFollowUser({ queryRef: loggedInUserQuery });
  const unfollowUser = useUnfollowUser({ queryRef: loggedInUserQuery });
  const { pushToast } = useToastActions();
  const showAuthModal = useAuthModal('sign-in');
  const track = useTrack();

  const handleFollowClick = useCallback(async () => {
    if (!loggedInUserId) {
      showAuthModal();

      return;
    }

    track('Follow Click', {
      followee: userToFollow.dbid,
      source,
    });

    await followUser(userToFollow.dbid);
    pushToast({ message: `You followed ${userToFollow.username}.` });
  }, [
    loggedInUserId,
    track,
    userToFollow.dbid,
    userToFollow.username,
    source,
    followUser,
    pushToast,
    showAuthModal,
  ]);

  const handleUnfollowClick = useCallback(async () => {
    track('Unfollow Click', {
      followee: userToFollow.dbid,
    });

    await unfollowUser(userToFollow.dbid);
    pushToast({ message: `You unfollowed ${userToFollow.username}.` });
  }, [track, userToFollow.dbid, userToFollow.username, unfollowUser, pushToast]);

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
