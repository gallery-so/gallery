import styled from 'styled-components';
import { BodyMedium, BodyRegular } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Button from 'components/core/Button/Button';
import { useCallback } from 'react';
import Spacer from 'components/core/Spacer/Spacer';
import { useModal } from 'contexts/modal/ModalContext';

function DeleteCollectionConfirmation() {
  const { hideModal } = useModal();
  const handleConfirmClick = useCallback(() => {
    console.log('call delete endpoint then close modal');
  }, []);

  const handleCancelClick = useCallback(() => {
    hideModal();
  }, [hideModal]);
  return (
    <StyledConfirmation>
      <BodyMedium>Are you sure you want to delete your collection?</BodyMedium>
      <Spacer height={8} />
      <BodyRegular color={colors.gray50}>
        This action is irreversible and will remove the collection from your
        gallery permanently.
      </BodyRegular>
      <Spacer height={20} />
      <ButtonContainer>
        <StyledCancelButton
          text="Nevermind"
          type="secondary"
          onClick={handleCancelClick}
        />
        <StyledButton text="Delete" onClick={handleConfirmClick} />
      </ButtonContainer>
    </StyledConfirmation>
  );
}
const StyledConfirmation = styled.div`
  width: 400px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledCancelButton = styled(Button)`
  border: none;
  width: 125px;
  margin-right: 8px;
`;

const StyledButton = styled(Button)`
  width: 125px;
`;

export default DeleteCollectionConfirmation;
