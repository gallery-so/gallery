import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';
import CloseIcon from 'src/icons/CloseIcon';

export default function FullScreenModal({ body }: { body: React.ReactNode }) {
  const { hideModal } = useModalActions();

  const handleClick = useCallback(() => {
    hideModal();
  }, [hideModal]);

  return (
    <StyledModal>
      <StyledCloseButton onClick={handleClick}>
        <CloseIcon isActive={true} />
      </StyledCloseButton>

      <StyledModalBody>{body}</StyledModalBody>
    </StyledModal>
  );
}

const StyledModal = styled.div`
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background: white;
`;

const StyledCloseButton = styled.button`
  position: absolute;
  top: 27px;
  right: 27px;
  font-size: 1rem;

  padding: 0;
  border: 0;
  cursor: pointer;
  background: none;
  z-index: 2;
`;

const StyledModalBody = styled.div`
  z-index: 1;
`;
