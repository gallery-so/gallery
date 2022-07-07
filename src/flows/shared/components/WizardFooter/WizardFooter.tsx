/**
 * TODO: this should be abstracted to be shared with WizardFooter
 */
import { memo, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import Button from 'components/core/Button/DeprecatedButton';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import useIsNextEnabled from 'contexts/wizard/useIsNextEnabled';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { GalleryWizardProps } from 'flows/shared/types';
import isPromise from 'utils/isPromise';
import { useRouter } from 'next/router';
import GenericActionModal from 'scenes/Modals/GenericActionModal';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';
import useKeyDown from 'hooks/useKeyDown';
import ActionText from 'components/core/ActionText/ActionText';

function WizardFooter({
  step,
  next: goToNextStep,
  previous: goToPreviousStep,
  history,
  shouldHideFooter,
  shouldHideSecondaryButton,
  footerButtonTextMap,
}: GalleryWizardProps) {
  const isNextEnabled = useIsNextEnabled();
  const { onNext, onPrevious } = useWizardCallback();
  const wizardId = useWizardId();
  const { back, query } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const collectionId = query.collectionId;

  const isFirstStep = useMemo(() => history.index === 0, [history.index]);

  const buttonText = useMemo(
    () => footerButtonTextMap?.[step.id] ?? 'Next',
    [footerButtonTextMap, step.id]
  );

  const handleNextClick = useCallback(async () => {
    if (onNext?.current) {
      const response = onNext.current();
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
        }

        setIsLoading(false);
      }

      // If there is collectionId, redirect to previous page
      if (collectionId) {
        back();
      }

      return;
    }

    goToNextStep();
  }, [back, collectionId, goToNextStep, onNext]);

  const { showModal } = useModalActions();

  const handlePreviousNavigation = useCallback(() => {
    if (onPrevious?.current) {
      void onPrevious.current();
    } else {
      goToPreviousStep();
    }
  }, [goToPreviousStep, onPrevious]);

  const handlePreviousClick = useCallback(() => {
    // If the user is onboarding, run previous callback without a modal
    if (wizardId === 'onboarding') {
      handlePreviousNavigation();
      return;
    }

    if (step.id === 'organizeCollection') {
      // If the user is editing from the collection page directly (has a collection ID), use default back()
      showModal({
        content: (
          <GenericActionModal
            buttonText="Leave"
            action={collectionId ? back : handlePreviousNavigation}
          />
        ),
        headerText: 'Would you like to stop editing?',
      });
      return;
    }
  }, [wizardId, step.id, handlePreviousNavigation, collectionId, showModal, back]);

  // We want to do the same thing if the user clicks escape, unless they are onboarding
  const handleEscapePress = useCallback(() => {
    if (wizardId === 'onboarding') return;
    handlePreviousClick();
  }, [handlePreviousClick, wizardId]);

  useKeyDown('Escape', handleEscapePress);

  if (shouldHideFooter) {
    return null;
  }

  return (
    <StyledWizardFooter>
      {shouldHideSecondaryButton ? null : (
        <ActionText color={colors.metal} onClick={handlePreviousClick}>
          {isFirstStep || (step.id === 'organizeCollection' && wizardId !== 'onboarding')
            ? 'Cancel'
            : 'Back'}
        </ActionText>
      )}
      <Spacer width={40} />
      <Button
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
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  height: ${FOOTER_HEIGHT}px;
  width: 100%;

  border-top: 1px solid ${colors.porcelain};
  background: ${colors.white};
`;

export default memo(WizardFooter);
