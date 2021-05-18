/**
 * TODO: this should be abstracted to be shared with WizardFooter
 */
import { memo, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import useIsNextEnabled from 'contexts/wizard/useIsNextEnabled';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { GalleryWizardProps } from 'flows/shared/types';
import isPromise from 'utils/isPromise';

function WizardFooter({
  step,
  next,
  previous,
  history,
  shouldHideFooter,
  shouldHideSecondaryButton,
  footerButtonTextMap,
}: GalleryWizardProps) {
  const isNextEnabled = useIsNextEnabled();
  const { onNext, onPrevious } = useWizardCallback();
  const [isLoading, setIsLoading] = useState(false);

  const isFirstStep = useMemo(() => {
    return history.index === 0;
  }, [history.index]);

  const buttonText = useMemo(() => {
    return footerButtonTextMap?.[step.id] ?? 'Next';
  }, [footerButtonTextMap, step.id]);

  const handleNextClick = useCallback(async () => {
    if (onNext?.current) {
      const res = onNext.current();
      // if onNext is an async function, activate the loader
      if (isPromise(res)) {
        try {
          setIsLoading(true);
          await res;
        } catch (e) {
          // if we want, we can display an error on the wizard
          // itself if the async request goes awry. that said,
          // we'll generally want to handle this on the Step
          // component itself
        }
        setIsLoading(false);
      }
      return;
    }
    next();
  }, [next, onNext]);

  const handlePreviousClick = useCallback(() => {
    onPrevious?.current ? onPrevious.current() : previous();
  }, [previous, onPrevious]);

  if (shouldHideFooter) {
    return null;
  }

  return (
    <StyledWizardFooter>
      {shouldHideSecondaryButton ? null : (
        <ActionText color={colors.gray10} onClick={handlePreviousClick}>
          {isFirstStep ? 'Cancel' : 'Back'}
        </ActionText>
      )}
      <Spacer width={40} />
      <StyledButton
        text={buttonText}
        onClick={handleNextClick}
        disabled={!isNextEnabled || isLoading}
        loading={isLoading}
        dataTestId="wizard-footer-next-button"
      />
      <Spacer width={24} />
    </StyledWizardFooter>
  );
}

export const FOOTER_HEIGHT = 66;

const StyledWizardFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  height: ${FOOTER_HEIGHT}px;
  width: 100%;

  border-top: 1px solid ${colors.gray40};
  background: white;
`;

const StyledButton = styled(Button)`
  min-width: 192px;
  padding: 0px 32px;
`;

export default memo(WizardFooter);
