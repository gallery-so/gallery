import { useCallback } from 'react';
import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';

const AddWalletModal = () => {
  const { showModal } = useModal();

  const onConnectSuccess = useCallback(() => {
    showModal(<ManageWalletsModal />);
  }, [showModal]);

  return (
    <Container>
      <WalletSelector mode={'ADD_WALLET'} onConnectSuccess={onConnectSuccess}/>
    </Container>
  );
};

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
