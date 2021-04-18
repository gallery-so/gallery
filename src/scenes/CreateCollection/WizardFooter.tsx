import { memo, useCallback } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import PrimaryButton from 'components/core/Button/PrimaryButton';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';

type Props = {
  next: WizardContext['next'];
  previous: WizardContext['previous'];
};

function WizardFooter({ next, previous }: Props) {
  const handleNextClick = useCallback(() => {
    // TODO 1: if final step, return to originating screen (e.g. collections page)
    // TODO 2: on certain steps, we want to do multiple things (e.g. go to next step AND oepn modal)
    next();
  }, [next]);

  const handlePreviousClick = useCallback(() => {
    // TODO: if first step, return to originating screen (e.g. collections page)
    // if (noPreviousStep) ...
    previous();
  }, [previous]);

  return (
    <StyledWizardFooter>
      <ActionText color={colors.lightGray} onClick={handlePreviousClick}>
        Back
      </ActionText>
      <Spacer width={24} />
      <PrimaryButton text="New Collection" onClick={handleNextClick} />
      <Spacer width={24} />
    </StyledWizardFooter>
  );
}

const StyledWizardFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  height: 66px;
  width: 100%;

  border-top: 1px solid black;
`;

export default memo(WizardFooter);
