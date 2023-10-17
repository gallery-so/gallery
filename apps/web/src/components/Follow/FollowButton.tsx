import { MouseEventHandler, useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { FollowButtonQueryFragment$key } from '~/generated/FollowButtonQueryFragment.graphql';
import { FollowButtonUserFragment$key } from '~/generated/FollowButtonUserFragment.graphql';
import useAuthModal from '~/hooks/useAuthModal';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useFollowUser from '~/shared/relay/useFollowUser';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import useUnfollowUser from '~/shared/relay/useUnfollowUser';
import colors from '~/shared/theme/colors';

import breakpoints from '../core/breakpoints';
import { GalleryChip } from '../core/Chip/Chip';

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
              followers @required(action: THROW) {
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
  const followersList = loggedInUserQuery.viewer?.user?.followers;

  const isFollowing = useMemo(() => {
    if (!followingList) {
      return false;
    }
    const followingIds = new Set(
      followingList.map((following: { id: string } | null) => following?.id)
    );
    return followingIds.has(userToFollow.id);
  }, [followingList, userToFollow.id]);

  const followsYou = useMemo(() => {
    if (!followersList) {
      return false;
    }
    const followerIds = new Set(
      followersList.map((following: { id: string } | null) => following?.id)
    );
    return followerIds.has(userToFollow.id);
  }, [followersList, userToFollow.id]);

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
      followType: followsYou ? 'Follow back' : 'Single follow',
      source,
    });

    await followUser(userToFollow.dbid);
    pushToast({ message: `You followed ${userToFollow.username}.` });
  }, [
    loggedInUserId,
    track,
    userToFollow.dbid,
    userToFollow.username,
    followsYou,
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
          <FollowingChip
            // no need to track this because it gets converted to `UnfollowChip` below on hover
            eventElementId={null}
            eventName={null}
            eventContext={null}
            className={className}
          >
            Following
          </FollowingChip>

          <UnfollowChipContainer>
            <UnfollowChip
              eventElementId="Unfollow Chip"
              eventName="Unfollow"
              eventContext={contexts.Social}
              onClick={handleUnfollowClick}
              className={className}
            >
              Unfollow
            </UnfollowChip>
          </UnfollowChipContainer>
        </FollowingChipContainer>
      );
    } else {
      return (
        <FollowChip
          eventElementId="Follow Chip"
          eventName="Follow"
          eventContext={contexts.Social}
          properties={{ isFollowBack: followsYou }}
          onClick={handleFollowClick}
          className={className}
        >
          {followsYou ? 'Follow back' : 'Follow'}
        </FollowChip>
      );
    }
  }, [isSelf, isFollowing, className, handleUnfollowClick, handleFollowClick, followsYou]);

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

const FollowingChip = styled(GalleryChip)`
  background-color: ${colors.faint};
  color: ${colors.black['800']};
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

const FollowChip = styled(GalleryChip)`
  background-color: ${colors.black['800']};
  color: ${colors.offWhite};
`;

const UnfollowChip = styled(GalleryChip)`
  background-color: ${colors.offWhite};

  color: #c72905;
  border: 1px solid #c72905;
`;
