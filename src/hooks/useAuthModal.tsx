import { useModal } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';

import WalletSelector from 'components/WalletSelector/WalletSelector';

export default function useAuthModal() {
  const { showModal } = useModal();

  return useCallback(() => {
    showModal(<WalletSelector />);
    // showModal(<div>connect your wallet</div>);
  }, [showModal]);
}
