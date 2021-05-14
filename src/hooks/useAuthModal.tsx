import { useCallback } from 'react';
import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';

export default function useAuthModal() {
  const { showModal } = useModal();

  return useCallback(() => {
    showModal(
      <Container>
        <WalletSelector />
      </Container>
    );
  }, [showModal]);
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 356px;
  height: 303px;
`;
