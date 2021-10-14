import { useCallback } from 'react';
import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import { ADD_WALLET_TO_USER } from 'types/Wallet';

const AddWalletModal = () => (
  <Container>
    <WalletSelector connectionMode={ADD_WALLET_TO_USER}/>
  </Container>
);

export default function useAddWalletModal() {
  const { showModal } = useModal();

  return useCallback(() => {
    showModal(<AddWalletModal />);
  }, [showModal]);
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 303px;
`;
