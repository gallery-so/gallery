import { useCallback } from 'react';
import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import { Heading } from 'components/core/Text/Text';
import TextButton from 'components/core/Button/TextButton';
import Spacer from 'components/core/Spacer/Spacer';
import { withWizard, WizardComponentProps } from 'react-albus';

function Header({ wizard: { push } }: WizardComponentProps) {
  const handleGalleryPreview = useCallback(() => {
    alert('TODO - go to gallery preview');
  }, []);

  const handleAddCollection = useCallback(() => {
    push('organizeCollection');
  }, [push]);

  return (
    <StyledHeader>
      <TitleContainer>
        <Heading>Organize your Gallery</Heading>
      </TitleContainer>
      <OptionsContainer>
        {/* TODO: support gallery preview
        <TextButton text="Preview Gallery" onClick={handleGalleryPreview} /> */}
        <Spacer width={16} />
        <StyledButton
          type="secondary"
          text="+ Add Collection"
          onClick={handleAddCollection}
        />
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
  align-items: center;
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
