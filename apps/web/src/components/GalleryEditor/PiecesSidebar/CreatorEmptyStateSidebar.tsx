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
    // [GAL-2710] open google form
  }, [track]);

  return (
    <StyledContainer gap={16} justify="center">
      <TitleS>Are you a creator?</TitleS>
      <BaseM>
        If you have created onchain work that you'd like to display on Gallery, we can associate
        them with your account.
      </BaseM>
      <BaseM>Please provide details about your project and our team will handle the rest!</BaseM>
      <Button onClick={handleClick}>Share project details</Button>
    </StyledContainer>
  );
}

const StyledContainer = styled(VStack)`
  padding: 16px;
  height: 100%;
`;
