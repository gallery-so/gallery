import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { flows } from 'shared/analytics/constants';

import { VStack } from '~/components/core/Spacer/Stack';
import { NftSelector } from '~/components/NftSelector/NftSelector';
import useUpdateProfileImage from '~/components/NftSelector/useUpdateProfileImage';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import { useProgress } from '~/contexts/onboardingProgress';

const onboardingStepName = 'add-profile-picture';
export function OnboardingAddProfilePicturePage() {
  const { setProfileImage } = useUpdateProfileImage();
  const { push } = useRouter();
  const { setProgress } = useProgress();

  const redirectToNextStep = useCallback(() => {
    push('/onboarding/add-user-info');
    setProgress('add-user-info');
  }, [push, setProgress]);

  const handleSelectToken = useCallback(
    (tokenId: string) => {
      setProfileImage({ tokenId });
      redirectToNextStep();
    },
    [redirectToNextStep, setProfileImage]
  );

  const handlePrevious = useCallback(() => {
    push('/onboarding/add-username');
    setProgress('add-username');
  }, [push, setProgress]);

  return (
    <VStack>
      <FullPageCenteredStep stepName={onboardingStepName}>
        <NftSelector
          onSelectToken={handleSelectToken}
          headerText={'Select profile picture'}
          eventFlow={flows['Web Signup Flow']}
        />
      </FullPageCenteredStep>
      <OnboardingFooter
        step={onboardingStepName}
        onNext={redirectToNextStep}
        isNextEnabled
        nextButtonVariant="secondary"
        previousTextOverride="Back"
        onPrevious={handlePrevious}
      />
    </VStack>
  );
}
