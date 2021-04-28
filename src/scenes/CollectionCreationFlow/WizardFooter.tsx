import { memo, useCallback, useMemo } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import PrimaryButton from 'components/core/Button/PrimaryButton';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import useIsNextEnabled from 'contexts/wizard/useIsNextEnabled';
import { navigate } from '@reach/router';

type Props = WizardContext;

function WizardFooter({ step, next, previous, history }: Props) {
  const isNextEnabled = useIsNextEnabled();

  const isFirstStep = useMemo(() => {
    return history.length === 1;
  }, [history]);

  const buttonText = useMemo(() => {
    switch (step.id) {
      case 'create':
        return 'New Collection';
      case 'add':
        return 'Create Collection';
      case 'organize':
        return 'Publish Gallery';
      default:
        return 'Next';
    }
  }, [step]);

  const handleNextClick = useCallback(() => {
    // TODO 1: if final step, return to originating screen (e.g. collections page)
    // TODO 2: on certain steps, we want to do multiple things (e.g. go to next step AND oepn modal)
    next();
  }, [next]);

  const handlePreviousClick = useCallback(() => {
    if (step.id === 'addUserInfo') {
      // TODO: originating screen will be different when onboarding vs creating a collection later
      navigate('welcome');
    }
    // if (noPreviousStep) ...
    previous();
  }, [previous, step.id]);

  return (
    <StyledWizardFooter>
      <ActionText color={colors.faintGray} onClick={handlePreviousClick}>
        {isFirstStep ? 'Cancel' : 'Back'}
      </ActionText>
      <Spacer width={24} />
      <StyledPrimaryButton
        disabled={!isNextEnabled}
        thicc={false}
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

  border-top: 1px solid black;
  background: white;
`;

const StyledPrimaryButton = styled(PrimaryButton)`
  min-width: 150px;
  height: 40px;
`;

export default memo(WizardFooter);
