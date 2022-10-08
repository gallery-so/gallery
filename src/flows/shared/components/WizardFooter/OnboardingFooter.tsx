/**
 * TODO: this should be abstracted to be shared with WizardFooter
 */
import { memo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Button } from 'components/core/Button/Button';
import colors from 'components/core/colors';
import isPromise from 'utils/isPromise';
import { useRouter } from 'next/router';
import ActionText from 'components/core/ActionText/ActionText';
import { HStack } from 'components/core/Spacer/Stack';
import {
  FOOTER_BUTTON_TEXT_MAP,
  FOOTER_HEIGHT,
  getStepIndex,
  StepName,
} from 'flows/shared/components/WizardFooter/constants';

type Props = {
  step: StepName;
  onNext: () => void | Promise<unknown>;
  isNextEnabled: boolean;
  onPrevious: () => void;
};

export function OnboardingFooter({ onNext, onPrevious, step, isNextEnabled }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const stepIndex = getStepIndex(step);
  const isFirstStep = stepIndex === 0;

  const handleNextClick = useCallback(async () => {
    const response = onNext();

    // If onNext is an async function, activate the loader
    if (isPromise(response)) {
      try {
        setIsLoading(true);
        await response;
      } catch {
        // If we want, we can display an error on the wizard
        // itself if the async request goes awry. that said,
        // we'll generally want to handle this on the Step
        // component itself
        // TODO(Terence): Report the error here at least
      }

      setIsLoading(false);
    }
  }, [onNext]);

  const handlePreviousClick = useCallback(() => {
    onPrevious();
  }, [onPrevious]);

  const nextButtonText = FOOTER_BUTTON_TEXT_MAP[step];

  return (
    <StyledWizardFooter>
      <HStack gap={40} align="center">
        <ActionText color={colors.metal} onClick={handlePreviousClick}>
          {isFirstStep ? 'Cancel' : 'Back'}
        </ActionText>
        <Button
          onClick={handleNextClick}
          disabled={!isNextEnabled}
          pending={isLoading}
          data-testid="wizard-footer-next-button"
        >
          {nextButtonText}
        </Button>
      </HStack>
    </StyledWizardFooter>
  );
}

const StyledWizardFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  height: ${FOOTER_HEIGHT}px;
  width: 100%;
  padding-right: 24px;

  border-top: 1px solid ${colors.porcelain};
  background: ${colors.white};
`;
