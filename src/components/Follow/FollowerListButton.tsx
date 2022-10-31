import TextButton from 'components/core/Button/TextButton';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import FollowList from './FollowList';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { FollowerListButtonFragment$key } from '__generated__/FollowerListButtonFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';

type Props = {
  userRef: FollowerListButtonFragment$key;
};

export default function FollowerListButton({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment FollowerListButtonFragment on GalleryUser {
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
    showModal({
      content: <FollowList userRef={user} />,
      isFullPage: isMobile,
      isPaddingDisabled: true,
      headerVariant: 'thicc',
    });
  }, [isMobile, showModal, track, user]);

  return <TextButton text={`Followers`} onClick={handleClick}></TextButton>;
}
