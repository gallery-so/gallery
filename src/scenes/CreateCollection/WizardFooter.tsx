import { memo } from 'react';
import styled from 'styled-components';
import ActionText from 'components/core/ActionText/ActionText';
import PrimaryButton from 'components/core/Button/PrimaryButton';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';

function WizardFooter() {
  return (
    <StyledWizardFooter>
      <ActionText color={colors.lightGray}>Back</ActionText>
      <Spacer width={24} />
      <PrimaryButton text="New Collection" />
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
