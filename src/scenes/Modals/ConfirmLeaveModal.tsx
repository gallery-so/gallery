import { BaseM } from 'components/core/Text/Text';
import breakpoints from 'components/core/breakpoints';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';
import styled from 'styled-components';
import useBackButton from 'hooks/useBackButton';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { ConfirmLeaveModalFragment$key } from '__generated__/ConfirmLeaveModalFragment.graphql';
import { useRouter } from 'next/router';

function Modal({ onClick }: { onClick: () => void }) {
  return (
    <StyledConfirmLeaveModal>
      <LeaveWrapper>
        <BaseM>Would you like to stop editing?</BaseM>
        <Spacer height={28}></Spacer>
        <StyledButton onClick={onClick} text={'Leave'} />
      </LeaveWrapper>
    </StyledConfirmLeaveModal>
  );
}

// A generic modal that simply "goes back" in history after user confirms
export function ConfirmBackModal() {
  const { hideModal } = useModalActions();
  const { back } = useRouter();

  const goBack = useCallback(() => {
    back();
    hideModal();
  }, [back, hideModal]);

  return <Modal onClick={goBack} />;
}

// References the username to go back to the user's profile after user confirms
export function ConfirmLeaveModal({ userRef }: { userRef: ConfirmLeaveModalFragment$key }) {
  const user = useFragment(
    graphql`
      fragment ConfirmLeaveModalFragment on GalleryUser {
        username @required(action: THROW)
      }
    `,
    userRef
  );

  const { hideModal } = useModalActions();
  const navigateBack = useBackButton({ username: user.username });

  const goBack = useCallback(() => {
    navigateBack();
    hideModal();
  }, [navigateBack, hideModal]);

  return <Modal onClick={goBack} />;
}

const StyledConfirmLeaveModal = styled.div`
  height: 100%;
  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

const StyledButton = styled(Button)`
  padding: 0px 12px;
  height: 30px;
`;

const LeaveWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  justify-content: center;
  place-items: center;
  height: 100%;
`;
