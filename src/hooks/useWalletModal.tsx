import { useCallback } from 'react';
import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import { CONNECT_WALLET_ONLY } from 'types/Wallet';

const WalletModal = () => (
  <Container>
    <WalletSelector connectionMode={CONNECT_WALLET_ONLY}/>
  </Container>
);

export default function useWalletModal() {
  const { showModal } = useModal();

  return useCallback(() => {
    showModal(<WalletModal />);
  }, [showModal]);
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  min-height: 300px;
`;
