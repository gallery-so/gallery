import { useCallback } from 'react';

import { useModalActions } from '~/contexts/modal/ModalContext';

import { NftSelector } from './NftSelector';
import useUpdateProfileImage from './useUpdateProfileImage';

type Props = {
  onSelectToken: (tokenId: string) => void;
  headerText: string;
};

export default function useNftSelector({ onSelectToken, headerText }: Props) {
  const { showModal } = useModalActions();

  return useCallback(() => {
    showModal({
      content: <NftSelector onSelectToken={onSelectToken} headerText={headerText} />,
    });
  }, [headerText, onSelectToken, showModal]);
}

export function useNftSelectorForProfilePicture() {
  const { setProfileImage } = useUpdateProfileImage();
  const { hideModal } = useModalActions();

  const handleSelectToken = useCallback(
    (tokenId: string) => {
      setProfileImage({ tokenId });
      hideModal();
    },
    [hideModal, setProfileImage]
  );

  return useNftSelector({
    onSelectToken: handleSelectToken,
    headerText: 'Select profile picture',
  });
}
