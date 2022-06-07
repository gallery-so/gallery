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
import { useRouter } from 'next/router';
import GenericActionModal from 'scenes/Modals/GenericActionModal';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useWizardId } from 'contexts/wizard/WizardDataProvider';

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

    next();
  }, [back, collectionId, next, onNext]);

  const { showModal } = useModalActions();

  // This triggers when a user edits a collection from /edit
  const handlePreviousClick = useCallback(() => {
    if (wizardId !== 'onboarding' && step.id === 'organizeCollection' && !collectionId) {
      showModal({
        content: (
          <GenericActionModal
            bodyText="Would you like to stop editing?"
            buttonText="Leave"
            action={() => {
              if (onPrevious?.current) {
                void onPrevious.current();
              } else {
                previous();
              }
            }}
          />
        ),
      });
      return;
    }

    // This triggers when the user edits from the collection page directly
    if (wizardId !== 'onboarding' && collectionId) {
      showModal({
        content: (
          <GenericActionModal
            bodyText="Would you like to stop editing?"
            buttonText="Leave"
            action={() => {
              back();
            }}
          />
        ),
      });
      return;
    }

    // If neither of the above, just go back
    if (onPrevious?.current) {
      void onPrevious.current();
    } else {
      previous();
    }
  }, [back, collectionId, onPrevious, previous, showModal, wizardId, step]);

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
  z-index: 50;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  height: ${FOOTER_HEIGHT}px;
  width: 100%;

  border-top: 1px solid ${colors.porcelain};
  background: ${colors.white};
`;

const StyledButton = styled(Button)`
  min-width: 192px;
  padding: 0px 32px;
`;

export default memo(WizardFooter);
