import styled from 'styled-components';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import { Button } from 'components/core/Button/Button';
import FullPageCenteredStep from 'flows/../../src/components/Onboarding/FullPageCenteredStep/FullPageCenteredStep';
import { useCallback } from 'react';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { VStack } from 'components/core/Spacer/Stack';
import { useRouter } from 'next/router';
import { getStepUrl } from 'flows/../../src/components/Onboarding/WizardFooter/constants';
import { OnboardingFooter } from 'flows/../../src/components/Onboarding/WizardFooter/OnboardingFooter';

export default function CreateFirstCollection() {
  const track = useTrack();

  const { push, query, back } = useRouter();
  const handleNextClick = useCallback(() => {
    track('Start new collection');

    push({
      pathname: getStepUrl('organize-collection'),
      query: { ...query },
    });
  }, [push, query, track]);

  return (
    <FullPageCenteredStep withFooter>
      <VStack gap={24} align="center">
        <VStack gap={8} align="center">
          <BaseXL>Create your first collection</BaseXL>
          <StyledBodyText>
            Organize your gallery with collections. Use them to group NFTs by creator, theme, or
            anything that feels right.
          </StyledBodyText>
        </VStack>
        <StyledButton onClick={handleNextClick}>New Collection</StyledButton>
      </VStack>

      <OnboardingFooter
        step={'create'}
        onNext={handleNextClick}
        isNextEnabled={true}
        onPrevious={back}
      />
    </FullPageCenteredStep>
  );
}

const StyledBodyText = styled(BaseM)`
  max-width: 390px;
  text-align: center;
`;

const StyledButton = styled(Button)`
  width: 200px;
`;
