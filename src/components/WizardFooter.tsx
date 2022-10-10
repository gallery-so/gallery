import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Button } from 'components/core/Button/Button';
import colors from 'components/core/colors';
import isPromise from 'utils/isPromise';
import ActionText from 'components/core/ActionText/ActionText';
import { HStack } from 'components/core/Spacer/Stack';
import { FOOTER_HEIGHT } from 'components/Onboarding/constants';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';

type Props = {
  isNextEnabled: boolean;
  nextText: string;
  previousText?: string;
  onPrevious?: () => void;
  onNext: () => void | Promise<unknown>;
};

export function WizardFooter({ onNext, onPrevious, isNextEnabled, nextText, previousText }: Props) {
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
