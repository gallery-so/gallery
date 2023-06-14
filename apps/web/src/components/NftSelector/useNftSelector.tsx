import { useCallback } from 'react';

import { useModalActions } from '~/contexts/modal/ModalContext';

import { NftSelector } from './NftSelector';

export default function useNftSelector() {
  const { showModal } = useModalActions();

  return useCallback(() => {
    showModal({
      content: <NftSelector />,
    });
  }, [showModal]);
}
