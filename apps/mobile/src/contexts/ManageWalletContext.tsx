import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { ethers } from 'ethers';
import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { WalletSelectorBottomSheet } from '~/components/Login/WalletSelectorBottomSheet';
import useSyncTokens from '~/screens/NftSelectorScreen/useSyncTokens';
import useAddWallet from '~/shared/hooks/useAddWallet';
import useCreateNonce from '~/shared/hooks/useCreateNonce';

type ManageWalletActions = {
  openManageWallet: ({ title }: { title?: string }) => void;
  dismissManageWallet: () => void;
  isSigningIn: boolean;
};

const ManageWalletActionsContext = createContext<ManageWalletActions | undefined>(undefined);

export const useManageWalletActions = (): ManageWalletActions => {
  const context = useContext(ManageWalletActionsContext);
  if (!context) {
    throw new Error('Attempted to use ManageWalletActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

const ManageWalletProvider = memo(({ children }: Props) => {
  const { address, isConnected, provider } = useWalletConnectModal();

  const bottomSheet = useRef<GalleryBottomSheetModalType | null>(null);
  const createNonce = useCreateNonce();
  const addWallet = useAddWallet();
  const { isSyncing, syncTokens } = useSyncTokens();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [title, setTitle] = useState('Which Network');

  // To track if the user has signed the message
  const hasSigned = useRef(false);

  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider]
  );

  const openManageWallet = useCallback(({ title }: { title?: string }) => {
    if (title) {
      setTitle(title);
    }

    bottomSheet.current?.present();
  }, []);

  const dismissManageWallet = useCallback(() => {
    bottomSheet.current?.dismiss();
  }, []);

  const handleSignMessage = useCallback(async () => {
    if (!web3Provider || !address || hasSigned.current) {
      return;
    }

    const signer = web3Provider.getSigner();
    const { nonce } = await createNonce(address, 'Ethereum');

    try {
      setIsSigningIn(true);
      const signature = await signer.signMessage(nonce);
      hasSigned.current = true;

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
  }, [address, addWallet, createNonce, isSyncing, provider, syncTokens, web3Provider]);

  useEffect(() => {
    if (isConnected && !hasSigned.current) {
      handleSignMessage();
    } else {
      setIsSigningIn(false);
    }
  }, [isConnected, handleSignMessage]);

  const value = useMemo(
    () => ({
      dismissManageWallet,
      openManageWallet,
      isSigningIn,
      title,
    }),
    [dismissManageWallet, openManageWallet, isSigningIn, title]
  );

  return (
    <ManageWalletActionsContext.Provider value={value}>
      <WalletSelectorBottomSheet
        title={value.title}
        ref={bottomSheet}
        isSignedIn={isSigningIn}
        onDismiss={dismissManageWallet}
      />
      {children}
    </ManageWalletActionsContext.Provider>
  );
});

ManageWalletProvider.displayName = 'ManageWalletProvider';

export default ManageWalletProvider;
