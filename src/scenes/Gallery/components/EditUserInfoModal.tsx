import { useCallback, useState } from 'react';
import styled from 'styled-components';
import UserInfoForm from 'components/Profile/UserInfoForm';
import Button from 'components/core/Button/Button';
import { useModal } from 'contexts/modal/ModalContext';

function EditUserInfoModal() {
  const { hideModal } = useModal();

  const [isValid, setIsValid] = useState(false); //base default value on username
  const [isPending, setIsPending] = useState(false);

  const onSubmit = useCallback(() => {
    if (isValid) {
      //   TODO call backend and save changes
      setIsPending(true);
      console.log('PUT to save changes');
      setTimeout(() => {
        //   if request is succesful, close modal
        setIsPending(false);
        hideModal();
      }, 1500);
    }
  }, [hideModal, isValid]);

  return (
    <StyledEditUserInfoModal>
      <UserInfoForm mode="Edit" handleIsValidChange={setIsValid}></UserInfoForm>
      <StyledButton
        disabled={!isValid || isPending}
        text="SAVE"
        onClick={onSubmit}
        isPending={isPending}
      ></StyledButton>
    </StyledEditUserInfoModal>
  );
}

const StyledEditUserInfoModal = styled.div`
  display: flex;
  flex-direction: column;

  width: 480px;
`;

type ButtonProps = {
  isPending: boolean;
};

const StyledButton = styled(Button)<ButtonProps>`
  padding: 0 16px;
  width: fit-content;
  align-self: flex-end;
  margin-top: 16px;

  //   TODO pending state styling
  //   ${({ isPending }) => isPending && 'background-color: white'}
`;

export default EditUserInfoModal;
