import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRef, useEffect } from 'react';
import { useDisconnect } from 'wagmi';

// This hook does a lot of dancing around RainbowKit and Wagmi to make sure
// that when you click the connect button, it always prompts you to pick a
// wallet to connect to.
//
// This might be more effort than it's worth. Maybe we just use the previous
// behavior where clicking "Ethereum" when already connected would skip to the
// allowlist check + signing step.
export const useConnectEthereum = () => {
  const disconnectingRef = useRef(false);

  // RainbowKit only returns an `openConnectModal` if not already connected. I
  // think this is to mimic how the connect button works, where, once connected,
  // it will show/open the account currently connected. To force the modal to
  // open on every click, we disconnect first.
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  // RainbowKit doesn't give us a promise or any other way to determine if the
  // connect modal has resulted in a connection, so we have to manually track
  // if we disconnected so that we can reconnect.
  useEffect(() => {
    if (!disconnectingRef.current) return;
    disconnectingRef.current = false;

    if (openConnectModal) {
      // calling this immediately doesn't seem to work, so wait until next tick
      const timer = setTimeout(openConnectModal, 0);
      return () => clearTimeout(timer);
    }
  }, [openConnectModal]);

  return () => {
    if (openConnectModal) {
      openConnectModal();
    } else {
      disconnectingRef.current = true;
      disconnect();
    }
  };
};
