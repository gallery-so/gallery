import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { BaseXL, BaseM } from 'components/core/Text/Text';
import { Button } from 'components/core/Button/Button';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { useCallback, useEffect } from 'react';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { VStack } from 'components/core/Spacer/Stack';

type ConfigProps = {
  onNext: () => void;
};

function useWizardConfig({ onNext }: ConfigProps) {
  const { setOnNext } = useWizardCallback();

  useEffect(() => {
    setOnNext(onNext);
  }, [setOnNext, onNext]);
}

function CreateFirstCollection({ next }: WizardContext) {
  const track = useTrack();

  const handleNextClick = useCallback(() => {
    track('Start new collection');
    next();
  }, [next, track]);

  useWizardConfig({ onNext: handleNextClick });

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

export default CreateFirstCollection;
