import { memo } from 'react';
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
  return (
    <StyledWizardFooter>
      <ActionText color={colors.lightGray} onClick={previous}>
        Back
      </ActionText>
      <Spacer width={24} />
      <PrimaryButton text="New Collection" onClick={next} />
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
