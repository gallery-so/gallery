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

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
    // key code is becoming deprecated~
    // listening for the escape key and hiding the modal
    // keycode is deprecated
      if(e.key === 'Escape'){
        hideModal();
      }
    }
    // key press can work too but its deprecated
    window.addEventListener('keydown', close)
    // clear the event listener after event fires
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
