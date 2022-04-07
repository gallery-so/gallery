import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { BaseXL, BaseM } from 'components/core/Text/Text';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { useCallback, useEffect } from 'react';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

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
      <BaseXL>Create your first collection</BaseXL>
      <Spacer height={8} />
      <StyledBodyText>
        Organize your gallery with collections. Use them to group NFTs by creator, theme, or
        anything that feels right.
      </StyledBodyText>
      <Spacer height={24} />
      <StyledButton text="New Collection" onClick={handleNextClick} />
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
