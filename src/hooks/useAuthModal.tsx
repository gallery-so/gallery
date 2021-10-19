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

  // *to do write test
  useEffect(() => {
    const close = (e: any) => {
      // key press can work too but keydown is more consistent through browsers
      if(e.keyCode === 27){
        hideModal();
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  },[hideModal])

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

  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  min-height: 300px;
`;
