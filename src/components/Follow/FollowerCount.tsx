import TextButton from 'components/core/Button/TextButton';
import { StyledTooltipParent } from 'components/Tooltip/Tooltip';
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
  className?: string;
};

export function pluralize(count: number, singular: string) {
  return count === 1 ? singular : `${singular}s`;
}

export default function FollowerCount({ userRef, className }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowerCountFragment on GalleryUser {
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

  return (
    <StyledFollowerCount className={className}>
      <StyledTooltipParent>
        <TextButton text={`Followers`} onClick={handleClick}></TextButton>
      </StyledTooltipParent>
    </StyledFollowerCount>
  );
}

export const StyledFollowerCount = styled.div`
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
`;
