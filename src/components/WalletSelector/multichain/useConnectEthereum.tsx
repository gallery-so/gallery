import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

// This hook does a lot of dancing around RainbowKit and wagmi to make sure
// that when you click the connect button, it always prompts you to pick a
// wallet to connect to.
//
// This might be more effort than it's worth. Maybe we just use the previous
// behavior where clicking "Ethereum" when already connected would skip to the
// allowlist check + signing step.
//
// RainbowKit also gives no way to determine when an open modal results in a
// connected wallet, so we kinda dance around a handful of hooks and a
// specially-tracked promise that we can resolve inside an effect. All really
// fragile and ugly code, but it works.
//
// I will continue to cry about hooks as a bad abstraction for wallet
// interactions, but I don't have a good alternative yet.
export const useConnectEthereum = () => {
  const disconnectingRef = useRef(false);
  const [promise, setPromise] = useState<null | {
    resolve: (address: string) => void;
    reject: (error: unknown) => void;
  }>(null);
  const { address } = useAccount();

  // Don't leave promises dangling as unresolved.
  useEffect(() => {
    if (promise) {
      return () => {
        // TODO: custom error so we can ignore it downstream?
        promise.reject(new Error('Promise replaced or component unmounted'));
      };
    }
  }, [promise]);

  // If we've got a promise initialized and an address connected and we're not
  // trying to disconnect-to-reconnect, then resolve the promise.
  useEffect(() => {
    if (promise && address && !disconnectingRef.current) {
      promise.resolve(address);
      setPromise(null);
    }
  }, [promise, address]);

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

  return useCallback(() => {
    if (openConnectModal) {
      openConnectModal();
    } else {
      disconnectingRef.current = true;
      disconnect();
    }

    return new Promise<string>((resolve, reject) => {
      setPromise({
        resolve,
        reject,
      });
    });
  }, [disconnect, openConnectModal]);
};
