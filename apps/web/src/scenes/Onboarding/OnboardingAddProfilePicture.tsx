import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { flows } from 'shared/analytics/constants';

import { VStack } from '~/components/core/Spacer/Stack';
import { NftSelector } from '~/components/NftSelector/NftSelector';
import useUpdateProfileImage from '~/components/NftSelector/useUpdateProfileImage';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';

export function OnboardingAddProfilePicture() {
  const { setProfileImage } = useUpdateProfileImage();
  const { push } = useRouter();

  const redirectToNextStep = useCallback(() => {
    push('/onboarding/add-user-info');
  }, [push]);

  const handleSelectToken = useCallback(
    (tokenId: string) => {
      setProfileImage({ tokenId });
      redirectToNextStep();
    },
    [redirectToNextStep, setProfileImage]
  );

  return (
    <VStack>
      <FullPageCenteredStep from={10} to={40}>
        <NftSelector
          onSelectToken={handleSelectToken}
          headerText={'Select profile picture'}
          eventFlow={flows['Web Signup Flow']}
        />
      </FullPageCenteredStep>
      <OnboardingFooter
        step="add-profile-picture"
        onNext={redirectToNextStep}
        isNextEnabled
        nextButtonVariant="secondary"
        previousTextOverride="Back"
      />
    </VStack>
  );
}
