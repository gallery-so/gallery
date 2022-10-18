import { HStack } from 'components/core/Spacer/Stack';
import Link from 'next/link';
import { NavbarLink } from 'contexts/globalLayout/GlobalNavbar/NavbarLink';
import { useRouter } from 'next/router';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useCallback } from 'react';
import { FeedMode } from 'components/Feed/Feed';

type Props = {
  feedMode: FeedMode;
  onChange: (mode: FeedMode) => void;
};

export function FeedCenterContent({ onChange, feedMode }: Props) {
  const track = useTrack();
  const handleFollowingModeClick = useCallback(
    (e) => {
      e.preventDefault();

      track('Feed: Clicked toggle to Following feed');
      onChange('FOLLOWING');
    },
    [onChange, track]
  );

  const handleWorldwideModeClick = useCallback(
    (e) => {
      e.preventDefault();

      track('Feed: Clicked toggle to Worldwide feed');
      onChange('WORLDWIDE');
    },
    [onChange, track]
  );

  return (
    <HStack gap={8}>
      <NavbarLink active={feedMode === 'FOLLOWING'} onClick={handleFollowingModeClick}>
        Following
      </NavbarLink>

      <NavbarLink active={feedMode === 'WORLDWIDE'} onClick={handleWorldwideModeClick}>
        Explore
      </NavbarLink>
    </HStack>
  );
}
