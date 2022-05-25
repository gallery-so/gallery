import TextButton from 'components/core/Button/TextButton';
import Tooltip, { StyledTooltipParent } from 'components/Tooltip/Tooltip';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { FollowerCountFragment$key } from '__generated__/FollowerCountFragment.graphql';
import FollowList from './FollowList';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type Props = {
  userRef: FollowerCountFragment$key;
};

export function pluralize(count: number, singular: string) {
  return count === 1 ? singular : `${singular}s`;
}

export default function FollowerCount({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowerCountFragment on GalleryUser {
        followers {
          dbid
        }
        following {
          dbid
        }
        ...FollowListFragment
      }
    `,
    userRef
  );

  const { showModal } = useModalActions();
  const track = useTrack();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const handleClick = useCallback(() => {
    track('View Follower List Click');
    showModal({ content: <FollowList userRef={user} />, isFullPage: isMobile });
  }, [isMobile, showModal, track, user]);

  const followerCount = user.followers?.length ?? 0;
  const followingCount = user.following?.length ?? 0;

  return (
    <StyledFollowerCount>
      <StyledTooltipParent>
        <TextButton text={`${followerCount}`} onClick={handleClick}></TextButton>
        <Tooltip
          text={`See ${followerCount} ${pluralize(
            followerCount,
            'follower'
          )} and ${followingCount} following`}
        />
      </StyledTooltipParent>
    </StyledFollowerCount>
  );
}

const StyledFollowerCount = styled.div``;
