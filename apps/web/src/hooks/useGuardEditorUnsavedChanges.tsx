import { useCallback, useRef } from 'react';

import { useModalActions } from '~/contexts/modal/ModalContext';
import GenericActionModal from '~/scenes/Modals/GenericActionModal';

export function useGuardEditorUnsavedChanges(callback: () => void, hasUnsavedChanges: boolean) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const { showModal } = useModalActions();

  return useCallback(() => {
    if (hasUnsavedChanges) {
      return showModal({
        content: (
          <GenericActionModal
            buttonText="Leave"
            action={() => {
              callbackRef.current();
            }}
          />
        ),
        headerText: 'Would you like to stop editing?',
      });
    }

    callbackRef.current();
  }, [hasUnsavedChanges, showModal]);
}
