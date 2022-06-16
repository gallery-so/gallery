import { useCallback } from 'react';
import styled from 'styled-components';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { withWizard, WizardComponentProps } from 'react-albus';
import TextButton from 'components/core/Button/TextButton';

function Header({ wizard: { push } }: WizardComponentProps) {
  const handleAddCollection = useCallback(() => {
    push('organizeCollection');
  }, [push]);

  return (
    <StyledHeader>
      <TitleContainer>
        <BaseXL>Organize your Gallery</BaseXL>
        <Spacer height={4} />
        <BaseM>Drag and drop to reorder your collection</BaseM>
      </TitleContainer>
      <OptionsContainer>
        <Spacer width={16} />
        <TextButton text="+ Add Collection" onClick={handleAddCollection}></TextButton>
      </OptionsContainer>
    </StyledHeader>
  );
}

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

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
