import { useModal } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';

// import Web3AuthSelector from '...'

export default function useAuthModal() {
  const { showModal } = useModal();

  return useCallback(() => {
    //   showModal(<Web3AuthSelector />);
    showModal(<div>connect your wallet</div>);
  }, [showModal]);
}
