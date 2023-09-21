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
import { useLogin } from 'src/hooks/useLogin';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { WalletSelectorBottomSheet } from '~/components/Login/WalletSelectorBottomSheet';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useAddWallet from '~/shared/hooks/useAddWallet';
import useCreateNonce from '~/shared/hooks/useCreateNonce';

import { useSyncTokenstActions } from './SyncTokensContext';

type openManageWalletProps = {
  title?: string;
  method?: 'auth' | 'add-wallet';
  onSuccess?: () => void;
};

type ManageWalletActions = {
  openManageWallet: ({ title, method, onSuccess }: openManageWalletProps) => void;
  dismissManageWallet: () => void;
  isSigningIn: boolean;
  address?: string;
  signature?: string;
  nonce?: string;
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

  const [login] = useLogin();
  const track = useTrack();

  const { isSyncing, syncTokens } = useSyncTokenstActions();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [title, setTitle] = useState('Network');

  // To track if the user has signed the message
  const hasSigned = useRef(false);
  const onSuccessRef = useRef<(() => void) | null>(null);
  const methodRef = useRef<'auth' | 'add-wallet'>('add-wallet');

  const web3Provider = useMemo(
    () => (provider ? new ethers.providers.Web3Provider(provider) : undefined),
    [provider]
  );

  const openManageWallet = useCallback(
    ({ title, onSuccess = () => {}, method = 'add-wallet' }: openManageWalletProps) => {
      if (title) {
        setTitle(title);
      }

      if (onSuccess) {
        onSuccessRef.current = onSuccess;
      }

      methodRef.current = method;

      bottomSheet.current?.present();
    },
    []
  );

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

      if (methodRef.current === 'add-wallet') {
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
      } else if (methodRef.current === 'auth') {
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
        }
      } else {
        return;
      }

      if (onSuccessRef.current) {
        onSuccessRef.current();
        onSuccessRef.current = null;
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
    login,
    isSyncing,
    provider,
    syncTokens,
    track,
    web3Provider,
  ]);

  useEffect(() => {
    if (isConnected && !hasSigned.current) {
      handleSignMessage();
    } else {
      setIsSigningIn(false);
    }
  }, [isConnected, handleSignMessage]);

  const value = useMemo(
    () => ({
      address,
      dismissManageWallet,
      openManageWallet,
      isSigningIn,
      title,
    }),
    [address, dismissManageWallet, openManageWallet, isSigningIn, title]
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
