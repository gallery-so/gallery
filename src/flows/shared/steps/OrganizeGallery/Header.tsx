import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import { BaseM, BaseXL } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { withWizard, WizardComponentProps } from 'react-albus';
import colors from 'components/core/colors';
import useKeyDown from 'hooks/useKeyDown';
import ConfirmLeaveModal from './ConfirmLeaveModal';
import { useModal } from 'contexts/modal/ModalContext';

function Header({ wizard: { push } }: WizardComponentProps) {
  // Const handleGalleryPreview = useCallback(() => {
  //   alert('TODO - go to gallery preview');
  // }, []);

  const handleAddCollection = useCallback(() => {
    push('organizeCollection');
  }, [push]);

  const escape = useKeyDown('Escape');
  const { showModal } = useModal();

  // Whenever user clicks escape, go back to the previous route
  useEffect(() => {
    console.log(escape);
    if (escape) {
      showModal(<ConfirmLeaveModal />);
    }
  }, [escape]);

  return (
    <StyledHeader>
      <TitleContainer>
        <BaseXL>Organize your Gallery</BaseXL>
        <Spacer height={4} />
        <BaseM>Drag and drop to reorder your collection</BaseM>
      </TitleContainer>
      <OptionsContainer>
        {/* TODO: support gallery preview
        <TextButton text="Preview Gallery" onClick={handleGalleryPreview} /> */}
        <Spacer width={16} />
        <StyledButton type="secondary" text="+ Add Collection" onClick={handleAddCollection} />
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

const StyledButton = styled(Button)`
  padding: 10px 16px;
`;

export default withWizard(Header);
