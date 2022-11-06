import { useEffect } from 'react';

import { useToastActions } from '~/contexts/toast/ToastContext';
import detectMobileDevice from '~/utils/detectMobileDevice';

export default function useNotOptimizedForMobileWarning() {
  const { pushToast } = useToastActions();

  useEffect(() => {
    if (detectMobileDevice()) {
      pushToast({
        message:
          "This page isn't optimized for mobile yet. Please use a computer to organize your Gallery.",
        autoClose: false,
      });
    }
  }, [pushToast]);
}
