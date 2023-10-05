import { useCallback, useState } from 'react';
import styled from 'styled-components';

import ActionText from '~/components/core/ActionText/ActionText';
import { Button } from '~/components/core/Button/Button';
import { HStack } from '~/components/core/Spacer/Stack';
import { FOOTER_HEIGHT, StepName } from '~/components/Onboarding/constants';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import colors from '~/shared/theme/colors';
import isPromise from '~/utils/isPromise';

type Props = {
  step: StepName;
  isNextEnabled: boolean;
  nextText: string;
  previousText?: string;
  onPrevious?: () => void;
  onNext: () => void | Promise<unknown>;
};

export function WizardFooter({
  onNext,
  onPrevious,
  isNextEnabled,
  nextText,
  previousText,
  step,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const reportError = useReportError();
  const handleNextClick = useCallback(async () => {
    const response = onNext();

    // If onNext is an async function, activate the loader
    if (isPromise(response)) {
      try {
        setIsLoading(true);
        await response;
      } catch (error) {
        // If we want, we can display an error on the wizard
        // itself if the async request goes awry. that said,
        // we'll generally want to handle this on the Step
        // component itself
        //
        // Just in case, we'll report the error here if all went wrong

        if (error instanceof Error) {
          reportError(error);
        } else {
          reportError('Uncaught error in WizardFooter onNext');
        }
      }

      setIsLoading(false);
    }
  }, [onNext, reportError]);

  return (
    <StyledWizardFooter>
      <HStack gap={40} align="center">
        {previousText && (
          <ActionText color={colors.metal} onClick={onPrevious}>
            {previousText}
          </ActionText>
        )}
        <Button
          eventElementId="Onboarding Wizard Button"
          eventName="Onboarding Wizard Next Click"
          properties={{ step }}
          onClick={handleNextClick}
          disabled={!isNextEnabled}
          pending={isLoading}
          data-testid="wizard-footer-next-button"
        >
          {nextText}
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
