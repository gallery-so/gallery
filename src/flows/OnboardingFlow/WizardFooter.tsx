/**
 * TODO: this should be abstracted to be shared with WizardFooter
 */
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import useIsNextEnabled from 'contexts/wizard/useIsNextEnabled';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import { GalleryWizardProps } from 'flows/shared/types';

function WizardFooter({
  step,
  next,
  previous,
  history,
  shouldHideFooter,
  shouldHideSecondaryButton,
}: GalleryWizardProps) {
  const isNextEnabled = useIsNextEnabled();
  const { onNext, onPrevious } = useWizardCallback();

  const isFirstStep = useMemo(() => {
    return history.index === 0;
  }, [history.index]);

  // TODO: consider putting this in context / useWizardConfig
  const buttonText = useMemo(() => {
    switch (step.id) {
      case 'addUserInfo':
        return 'Save';
      case 'create':
        return 'New Collection';
      case 'organizeCollection':
        return 'Create Collection';
      case 'organizeGallery':
        return 'Publish Gallery';
      default:
        return 'Next';
    }
  }, [step]);

  const handleNextClick = useCallback(() => {
    onNext?.current ? onNext.current() : next();
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
        disabled={!isNextEnabled}
        text={buttonText}
        onClick={handleNextClick}
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

  border-top: 1px solid ${colors.gray50};
  background: white;
`;

const StyledButton = styled(Button)`
  min-width: 190px;
  padding: 0px 32px;
`;

export default memo(WizardFooter);
