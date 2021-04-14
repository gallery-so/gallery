import { useModal } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';

import LockedWalletSelector from 'components/WalletSelector/LockedWalletSelector';

export default function useAuthModal() {
  const { showModal } = useModal();

  return useCallback(() => {
    showModal(<LockedWalletSelector />);
  }, [showModal]);
}
