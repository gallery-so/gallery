import { configure, handleResponse, WalletMobileSDKEVMProvider } from '@coinbase/wallet-mobile-sdk';
import * as Device from 'expo-device';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import { SignerVariables } from 'shared/hooks/useAuthPayloadQuery';
import useCreateNonce from 'shared/hooks/useCreateNonce';
import { useGetUserByWalletAddressImperatively } from 'shared/hooks/useGetUserByWalletAddress';

import { useToastActions } from '~/contexts/ToastContext';

type Props = {
  onIsSigningIn: (isSigningIn: boolean) => void;
  onConnect?: () => void;
  onSignedIn: (p: SignerVariables & { userExists: boolean }) => void;
};

// Configure Mobile SDK
configure({
  hostURL: new URL('https://wallet.coinbase.com/wsegue'),
  callbackURL: new URL('gallerylabs://'),
  hostPackageName: 'org.usegallery',
});

const provider = new WalletMobileSDKEVMProvider();
const storage = new MMKV();

export function useCoinbaseWallet({ onIsSigningIn, onSignedIn }: Props) {
  const createNonce = useCreateNonce();
  const getUserByWalletAddress = useGetUserByWalletAddressImperatively();
  const track = useTrack();

  const cachedAddress = useMemo(() => storage.getString('address'), []);
  const [address, setAddress] = useState(cachedAddress);

  const isConnected = address !== undefined;

  useEffect(function setupDeeplinkHandling() {
    // Pass incoming deeplinks into Mobile SDK
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleResponse(new URL(url));
    });

    return function cleanup() {
      subscription.remove();
    };
  }, []);

  const personalSign = useCallback(async () => {
    if (!address) {
      return;
    }

    onIsSigningIn(true);
    const { nonce, message } = await createNonce();
    const userExists = Boolean(await getUserByWalletAddress({ address, chain: 'Ethereum' }));

    try {
      const signature = (await provider.request({
        method: 'personal_sign',
        params: [nonce, address],
      })) as string;

      onSignedIn({
        address,
        nonce,
        message,
        signature,
        userExists,
      });
    } catch (e) {
      if (e instanceof Error) {
        track('Failed to sign message with Coinbase Wallet');
      }
    } finally {
      onIsSigningIn(false);
    }
  }, [address, createNonce, getUserByWalletAddress, onIsSigningIn, onSignedIn, track]);

  const { pushToast } = useToastActions();

  // Initiate connection to Wallet
  const connectWallet = useCallback(async () => {
    if (!Device.isDevice) {
      pushToast({
        message: 'This will only work on a physical device with CBW installed.',
      });
      return;
    }

    try {
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
        params: [],
      })) as string[];
      if (accounts[0]) {
        setAddress(accounts[0]);
        storage.set('address', accounts[0]);

        personalSign();
      } else {
        track('Failed to retrieve account from Coinbase Wallet');
        throw new Error('No account found');
      }
    } catch (e) {
      if (e instanceof Error) {
        track('Failed to retrieve account from Coinbase Wallet');
      }
    }
  }, [personalSign, pushToast, track]);

  return {
    isConnected,
    address,
    open: connectWallet,
  };
}
