import { useCallback } from 'react';
import styled from 'styled-components';
import { BaseM, TitleDiatypeL } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { withWizard, WizardComponentProps } from 'react-albus';
import { Button } from 'components/core/Button/Button';

function Header({ wizard: { push } }: WizardComponentProps) {
  const handleAddCollection = useCallback(() => {
    push('organizeCollection');
  }, [push]);

  return (
    <StyledHeader>
      <TitleContainer>
        <TitleDiatypeL>Your collections</TitleDiatypeL>
        <BaseM>Drag to re-order collections</BaseM>
      </TitleContainer>
      <OptionsContainer>
        <Spacer width={16} />
        <Button text="Add" type="secondary" onClick={handleAddCollection} />
      </OptionsContainer>
    </StyledHeader>
  );
}

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  width: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;

  text-transform: uppercase;
`;

export default withWizard(Header);
