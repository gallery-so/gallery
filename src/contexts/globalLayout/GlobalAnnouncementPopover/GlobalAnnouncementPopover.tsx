import { useModalActions } from 'contexts/modal/ModalContext';
import { useEffect } from 'react';

export default function GlobalAnnouncementPopover() {
  return <>hi</>;
}

const GLOBAL_ANNOUNCEMENT_POPOVER_DELAY_MS = 400;

export function useGlobalAnnouncementPopover() {
  const { showModal } = useModalActions();

  useEffect(() => {
    setTimeout(() => {
      showModal({ content: <GlobalAnnouncementPopover />, isFullPage: true });
    }, GLOBAL_ANNOUNCEMENT_POPOVER_DELAY_MS);
  }, [showModal]);
}
