import { BaseM } from 'components/core/Text/Text';
import breakpoints from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { useModal } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';
import styled from 'styled-components';
// import { useAuthenticatedUsername } from 'hooks/api/users/useUser';
import useBackButton from 'hooks/useBackButton';

function ConfirmLeaveModal() {
  const { hideModal } = useModal();

  // FIXME: Do we want escape on /edit to go back to the previous state in history? Or simply always go to /{username}?
  const username = 'connorr'; // useAuthenticatedUsername();
  const navigateBack = useBackButton({ username });

  const goBack = useCallback(() => {
    navigateBack();
    hideModal();
  }, [navigateBack]);

  return (
    <StyledConfirmLeaveModal>
      <LeaveWrapper>
        <BaseM>Would you like to stop editing?</BaseM>
        <Spacer height={28}></Spacer>
        <StyledButton onClick={goBack} text={'Leave'} />
      </LeaveWrapper>
    </StyledConfirmLeaveModal>
  );
}

const StyledConfirmLeaveModal = styled.div`
  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

const StyledButton = styled(Button)`
  padding: 0px 16px;
`;

const LeaveWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  justify-content: center;
  place-items: center;
`;

export default ConfirmLeaveModal;
