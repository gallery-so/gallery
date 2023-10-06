import { useCallback } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { TitleS } from '~/components/core/Text/Text';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

export default function CreatorEmptyStateSidebar() {
  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Creator sidebar share project details click');
    window.open('https://forms.gle/yJLK93LLw3618Y8y8', '_blank');
  }, [track]);

  // TODO: this content needs to be updated / changed
  return (
    <StyledContainer gap={16} justify="center">
      <TitleS>Are you a creator?</TitleS>
      <BaseM>
        If you've created onchain work that you'd like to display in your Gallery, please provide
        details about your project and our team will handle the rest!
      </BaseM>
      <Button eventElementId={null} eventName={null} onClick={handleClick}>
        Share project details
      </Button>
    </StyledContainer>
  );
}

const StyledContainer = styled(VStack)`
  padding: 16px;
  height: 100%;
`;
