import { useCallback } from 'react';
import styled from 'styled-components';
import Button from 'components/core/Button/Button';
import { Caption, Heading } from 'components/core/Text/Text';
// Import TextButton from 'components/core/Button/TextButton';
import Spacer from 'components/core/Spacer/Spacer';
import { withWizard, WizardComponentProps } from 'react-albus';
import colors from 'components/core/colors';

function Header({ wizard: { push } }: WizardComponentProps) {
  // Const handleGalleryPreview = useCallback(() => {
  //   alert('TODO - go to gallery preview');
  // }, []);

  const handleAddCollection = useCallback(() => {
    push('organizeCollection');
  }, [push]);

  return (
    <StyledHeader>
      <TitleContainer>
        <Heading>Organize your Gallery</Heading>
        <Spacer height={4} />
        <Caption color={colors.gray50}>
          Drag and drop to reorder your collection
        </Caption>
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
