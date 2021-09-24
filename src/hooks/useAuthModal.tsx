import { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

const AuthModal = () => {
  const { hideModal } = useModal();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      hideModal();
    }
  }, [isAuthenticated, hideModal]);

  return (
    <Container>
      <WalletSelector />
    </Container>
  );
};

export default function useAuthModal() {
  const { showModal } = useModal();

  return useCallback(() => {
    showModal(<AuthModal />);
  }, [showModal]);
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 303px;
`;
