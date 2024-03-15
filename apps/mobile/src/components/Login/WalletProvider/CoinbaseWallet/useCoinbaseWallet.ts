import { configure, handleResponse, WalletMobileSDKEVMProvider } from '@coinbase/wallet-mobile-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import useCreateNonce from 'shared/hooks/useCreateNonce';

type Props = {
  onIsSigningIn: (isSigningIn: boolean) => void;
  onConnect?: () => void;
  onSignedIn: (address: string, nonce: string, signature: string, userExist: boolean) => void;
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
    const { nonce, user_exists: userExist } = await createNonce(address, 'Ethereum');

    try {
      const signature = (await provider.request({
        method: 'personal_sign',
        params: [nonce, address],
      })) as string;

      onSignedIn(address, nonce, signature, userExist);
    } catch (e) {
      if (e instanceof Error) {
        track('Failed to sign message with Coinbase Wallet');
      }
    } finally {
      onIsSigningIn(false);
    }
  }, [address, createNonce, onIsSigningIn, onSignedIn, track]);

  // Initiate connection to Wallet
  const connectWallet = useCallback(async () => {
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
  }, [personalSign, track]);

  return {
    isConnected,
    address,
    open: connectWallet,
  };
}
