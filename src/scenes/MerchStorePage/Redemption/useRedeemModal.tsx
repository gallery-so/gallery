import { useCallback } from 'react';

import { useModalActions } from '~/contexts/modal/ModalContext';

import RedeemModal from './RedeemModal';

export default function useRedeemModal() {
  const { showModal } = useModalActions();

  return useCallback(() => {
    showModal({
      content: <RedeemModal />,
    });
  }, [showModal]);
}
