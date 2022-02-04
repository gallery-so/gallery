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
import { usePossiblyAuthenticatedUser } from 'hooks/api/users/useUser';

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
  const { push, query } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const user = usePossiblyAuthenticatedUser();
  const username = user?.username;

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

      // If coming from single collection page, the user should be redirected to the collection page
      if (collectionId) {
        void push(`/${username}/${collectionId}`);
      }

      return;
    }

    next();
  }, [collectionId, next, onNext, push, username]);

  const handlePreviousClick = useCallback(() => {
    // If coming from single collection page, the user should be redirected to the collection page
    if (collectionId) {
      void push(`/${username}/${collectionId}`);
    }

    if (onPrevious?.current) {
      void onPrevious.current();
    } else {
      previous();
    }
  }, [collectionId, onPrevious, push, username, previous]);

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
  z-index: 50;

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
