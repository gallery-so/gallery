import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { SignerVariables } from 'shared/hooks/useAuthPayloadQuery';
import useCreateNonce from 'shared/hooks/useCreateNonce';
import { useGetUserByWalletAddressImperatively } from 'shared/hooks/useGetUserByWalletAddress';
import { noop } from 'shared/utils/noop';

type Props = {
  onIsSigningIn: (isSigningIn: boolean) => void;
  onConnect?: () => void;
  onSignedIn: (p: SignerVariables & { userExists: boolean }) => void;
};

export function useWalletConnect({ onConnect = noop, onSignedIn, onIsSigningIn }: Props) {
  // To track if the user has signed the message
  const hasSigned = useRef(false);
  const isSigningIn = useRef(false);
  const hasConnectedWallet = useRef(false);

  const { address, open, isConnected, provider } = useWalletConnectModal();
  const createNonce = useCreateNonce();
  const getUserByWalletAddress = useGetUserByWalletAddressImperatively();

  const web3Provider = useMemo(
    () => (provider ? new ethers.BrowserProvider(provider) : undefined),
    [provider]
  );

  const clearState = useCallback(() => {
    hasSigned.current = false;
    hasConnectedWallet.current = false;
    onIsSigningIn(false);
    provider?.disconnect();
  }, [onIsSigningIn, provider]);

  const handleOpen = useCallback(() => {
    open();
  }, [open]);

  const handleSignMessage = useCallback(async () => {
    if (!web3Provider || !address || hasSigned.current) {
      return;
    }

    isSigningIn.current = true;

    const signer = await web3Provider.getSigner();
    const { nonce, message } = await createNonce();
    const userExists = Boolean(await getUserByWalletAddress({ address, chain: 'Ethereum' }));

    try {
      onIsSigningIn(true);
      const signature = await signer.signMessage(message);
      hasSigned.current = true;
      onSignedIn({
        address,
        nonce,
        message,
        signature,
        userExists,
      });
    } catch (error) {
      clearState();
    } finally {
      isSigningIn.current = false;
      clearState();
    }
  }, [
    address,
    clearState,
    createNonce,
    getUserByWalletAddress,
    onIsSigningIn,
    onSignedIn,
    web3Provider,
  ]);

  // To check if the user has connected the wallet
  useEffect(() => {
    if (isConnected && hasConnectedWallet.current) {
      provider?.disconnect();
      return;
    }

    if (isConnected) {
      hasConnectedWallet.current = true;
      onConnect();
    }
  }, [isConnected, onConnect, provider]);

  useEffect(() => {
    if (isConnected && !hasSigned.current && hasConnectedWallet.current && !isSigningIn.current) {
      handleSignMessage();
    }
  }, [isConnected, handleSignMessage]);

  return {
    isConnected,
    address,
    open: handleOpen,
  };
}
