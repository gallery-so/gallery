import { MouseEventHandler, useCallback } from 'react';
import styled from 'styled-components';

import { useTrack } from '~/contexts/analytics/AnalyticsContext';

import TextButton, { StyledButtonText } from '../core/Button/TextButton';
import colors from '../core/colors';
import { HStack } from '../core/Spacer/Stack';
import { FeedMode } from './Feed';

type Props = {
  feedMode: FeedMode;
  setFeedMode: (mode: FeedMode) => void;
};

export default function FeedModeSelector({ feedMode, setFeedMode }: Props) {
  const track = useTrack();
  const handleFollowingModeClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();

      track('Feed: Clicked toggle to Following feed');
      setFeedMode('FOLLOWING');
    },
    [setFeedMode, track]
  );

  const handleWorldwideModeClick = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault();

      track('Feed: Clicked toggle to Worldwide feed');
      setFeedMode('WORLDWIDE');
    },
    [setFeedMode, track]
  );

  return (
    <HStack gap={8}>
      <StyledTextButton
        active={feedMode === 'FOLLOWING'}
        onClick={handleFollowingModeClick}
        text="Following"
      />

      <StyledTextButton
        active={feedMode === 'WORLDWIDE'}
        onClick={handleWorldwideModeClick}
        text="Worldwide"
      />
    </HStack>
  );
}

const StyledTextButton = styled(TextButton)<{ active: boolean }>`
  padding: 8px;

  ${({ active }) => active && ` ${StyledButtonText} {color: ${colors.offBlack};}`}
`;
