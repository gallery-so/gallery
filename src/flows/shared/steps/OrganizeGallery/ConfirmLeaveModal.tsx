import { BaseM } from 'components/core/Text/Text';
import TextButton from 'components/core/Button/TextButton';
import breakpoints from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { useModal } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

function ConfirmLeaveModal() {
  const { hideModal } = useModal();
  const { back } = useRouter();

  const goBack = useCallback(() => {
    back();
    hideModal();
  }, []);

  return (
    <StyledConfirmLeaveModal>
      <LeaveWrapper>
        <BaseM>Would you like to stop editing?</BaseM>
        <Spacer height={12}></Spacer>
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
