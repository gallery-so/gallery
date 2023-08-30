import { useNavigation } from '@react-navigation/native';
import { useWalletConnectModal, WalletConnectModal } from '@walletconnect/modal-react-native';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLogin } from 'src/hooks/useLogin';

import { useToastActions } from '~/contexts/ToastContext';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { navigateToNotificationUpsellOrHomeScreen } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useCreateNonce from '~/shared/hooks/useCreateNonce';

import { Button } from '../../components/Button';
import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { WalletSelectorBottomSheet } from './WalletSelectorBottomSheet';

const projectId = '93ea9c14da3ab92ac4b72d97c124b96c';

const providerMetadata = {
  name: 'Gallery',
  description: 'Gallery Mobile App',
  url: 'https://gallery.so',
  icons: [
    'https://f4shnljo4g7olt4wifnpdfz6752po37hr3waoaxakgpxqw64jojq.arweave.net/LyR2rS7hvuXPlkFa8Zc-_3T3b-eO7AcC4FGfeFvcS5M',
  ],
  redirect: {
    native: 'applinks:gallery.so/',
    universal: 'https://gallery.so',
  },
};

export function ConnectWalletButton() {
  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { open, isConnected, provider, address } = useWalletConnectModal();
  const createNonce = useCreateNonce();
  const { pushToast } = useToastActions();

  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [login] = useLogin();
  const track = useTrack();

  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider]
  );

  const handleSignMessage = useCallback(async () => {
    if (!web3Provider || !address) {
      return;
    }

    const signer = web3Provider.getSigner();
    const { nonce, user_exists: userExist } = await createNonce(address, 'Ethereum');

    if (!userExist) {
      pushToast({
        message: 'You need to sign up first',
        withoutNavbar: true,
      });
      setIsLoading(false);
      provider?.disconnect();
      return;
    }

    try {
      setIsLoading(true);
      setIsSigningIn(true);
      const signature = await signer.signMessage(nonce);

      const result = await login({
        eoa: {
          signature,
          nonce,
          chainPubKey: {
            pubKey: address,
            chain: 'Ethereum',
          },
        },
      });

      if (result.kind === 'failure') {
        track('Sign In Failure', { 'Sign in method': 'Wallet Connect', error: result.message });
      } else {
        track('Sign In Success', { 'Sign in method': 'Wallet Connect' });
        await navigateToNotificationUpsellOrHomeScreen(navigation);
      }
    } catch (error) {
      pushToast({
        message: 'The signature was rejected. Try again or use another wallet.',
        withoutNavbar: true,
      });
      provider?.disconnect();
    } finally {
      setIsLoading(false);
      setIsSigningIn(false);
    }
  }, [address, createNonce, login, provider, pushToast, web3Provider, navigation, track]);

  const handleEthereumConnect = useCallback(async () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    open();
  }, [isConnected, open, provider]);

  const handleButtonPress = useCallback(() => {
    bottomSheet.current?.present();
  }, []);

  const handleDismiss = useCallback(() => {
    provider?.disconnect();
    setIsLoading(false);
    setIsSigningIn(false);
  }, [provider]);

  useEffect(() => {
    if (isConnected) {
      handleSignMessage();
    } else {
      setIsLoading(false);
      setIsSigningIn(false);
    }
  }, [isConnected, handleSignMessage]);

  const bottomSheet = useRef<GalleryBottomSheetModalType | null>(null);

  return (
    <>
      <Button
        onPress={handleButtonPress}
        text="connect wallet"
        eventElementId={null}
        eventName={null}
        loading={isLoading}
      />
      <WalletSelectorBottomSheet
        ref={bottomSheet}
        isSignedIn={isSigningIn}
        onConnectWallet={handleEthereumConnect}
        onDismiss={handleDismiss}
      />
      <WalletConnectModal projectId={projectId} providerMetadata={providerMetadata} />
    </>
  );
}
