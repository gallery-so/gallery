import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { UpsellBannerQuery } from '~/generated/UpsellBannerQuery.graphql';
import useSyncTokens from '~/screens/NftSelectorScreen/useSyncTokens';
import useAddWallet from '~/shared/hooks/useAddWallet';
import useCreateNonce from '~/shared/hooks/useCreateNonce';
import colors from '~/shared/theme/colors';

import { Button } from './Button';
import { GalleryBottomSheetModalType } from './GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { WalletSelectorBottomSheet } from './Login/WalletSelectorBottomSheet';
import { Typography } from './Typography';

export function UpsellBanner() {
  const query = useLazyLoadQuery<UpsellBannerQuery>(
    graphql`
      query UpsellBannerQuery {
        viewer {
          ... on Viewer {
            user {
              __typename
              primaryWallet {
                __typename
              }
            }
          }
        }
      }
    `,
    {}
  );

  const { top } = useSafeAreaInsets();
  const bottomSheet = useRef<GalleryBottomSheetModalType | null>(null);

  const [isSigningIn, setIsSigningIn] = useState(false);
  const { address, isConnected, provider } = useWalletConnectModal();
  const createNonce = useCreateNonce();
  const { isSyncing, syncTokens } = useSyncTokens();
  const addWallet = useAddWallet();

  const userHasWallet = query.viewer?.user?.primaryWallet?.__typename === 'Wallet' ?? false;

  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider]
  );

  const handleSignMessage = useCallback(async () => {
    if (!web3Provider || !address || userHasWallet) {
      return;
    }

    const signer = web3Provider.getSigner();
    const { nonce } = await createNonce(address, 'Ethereum');

    try {
      setIsSigningIn(true);
      const signature = await signer.signMessage(nonce);

      const { signatureValid } = await addWallet({
        authMechanism: {
          eoa: {
            signature,
            nonce,
            chainPubKey: {
              pubKey: address,
              chain: 'Ethereum',
            },
          },
        },
        chainAddress: {
          address,
          chain: 'Ethereum',
        },
      });

      if (!signatureValid) {
        throw new Error('Signature is not valid');
      }

      if (!isSyncing) {
        syncTokens('Ethereum');
      }

      bottomSheet.current?.dismiss();
    } catch (error) {
      provider?.disconnect();
    } finally {
      setIsSigningIn(false);
    }
  }, [
    address,
    addWallet,
    createNonce,
    isSyncing,
    provider,
    syncTokens,
    userHasWallet,
    web3Provider,
  ]);

  const handleConnectWallet = useCallback(() => {
    bottomSheet.current?.present();
  }, []);

  useEffect(() => {
    if (isConnected) {
      handleSignMessage();
    } else {
      setIsSigningIn(false);
    }
  }, [isConnected, handleSignMessage]);

  if (userHasWallet) {
    return (
      <View
        style={{
          paddingTop: top,
        }}
        className="bg-white dark:bg-black-900"
      ></View>
    );
  }

  return (
    <View
      className="bg-activeBlue w-full px-4 py-2 flex-row items-center justify-between"
      style={{
        paddingTop: top,
      }}
    >
      <View>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
          className="text-offWhite text-sm"
        >
          Gallery is better with a wallet
        </Typography>
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          className="text-offWhite text-xs"
        >
          Add your wallet to start posting and curating
        </Typography>
      </View>
      <View className="flex-row items-center space-x-2">
        <Button
          onPress={handleConnectWallet}
          text="connect"
          size="xs"
          variant="secondary"
          fontWeight="Bold"
          eventElementId="Press Connect Wallet Upsell Banner"
          eventName="Press Connect Wallet Upsell Banner"
        />
        <GalleryTouchableOpacity
          className="p-2"
          eventElementId="Close Upsell Banner"
          eventName="Close Upsell Banner"
        >
          <XMarkIcon color={colors.offWhite} />
        </GalleryTouchableOpacity>
      </View>

      <WalletSelectorBottomSheet
        title="Which Network"
        ref={bottomSheet}
        isSignedIn={isSigningIn}
        onDismiss={() => {}}
      />
    </View>
  );
}
