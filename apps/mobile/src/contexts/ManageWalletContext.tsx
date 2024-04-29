import { useNavigation } from '@react-navigation/native';
import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SignerVariables } from 'shared/hooks/useAuthPayloadQuery';
import { useLogin } from 'src/hooks/useLogin';

import WalletSelectorBottomSheet from '~/components/Login/WalletSelectorBottomSheet';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { navigateToNotificationUpsellOrHomeScreen } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useAddWallet from '~/shared/hooks/useAddWallet';
import { noop } from '~/shared/utils/noop';

import { useBottomSheetModalActions } from './BottomSheetModalContext';
import { useSyncTokensActions } from './SyncTokensContext';

export type OpenManageWalletProps = {
  title?: string;
  method?: 'auth' | 'add-wallet';
  onSuccess?: () => void;
};

type ManageWalletActions = {
  openManageWallet: (o: OpenManageWalletProps) => void;
  dismissManageWallet: () => void;
  isSigningIn: boolean;
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
  const addWallet = useAddWallet();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const [login] = useLogin();
  const track = useTrack();

  const { isSyncing, syncTokens } = useSyncTokensActions();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [title, setTitle] = useState('Select wallet');

  const onSuccessRef = useRef<(() => void) | null>(null);
  const methodRef = useRef<'auth' | 'add-wallet'>('add-wallet');

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const dismissManageWallet = useCallback(() => {
    hideBottomSheetModal();
  }, [hideBottomSheetModal]);

  const handleOnSignedIn = useCallback(
    async ({
      address,
      nonce,
      message,
      signature,
      userExists,
    }: SignerVariables & {
      userExists: boolean;
    }) => {
      if (!userExists) {
        navigation.navigate('OnboardingEmail', {
          authMethod: 'Wallet',
          authMechanism: {
            authMechanismType: 'eoa',
            chain: 'Ethereum',
            address,
            nonce,
            message,
            signature,
            userFriendlyWalletName: 'Unknown',
          },
        });
      }

      if (methodRef.current === 'add-wallet') {
        const { signatureValid } = await addWallet({
          authMechanism: {
            eoa: {
              nonce,
              message,
              signature,
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
      } else if (methodRef.current === 'auth' && userExists) {
        const result = await login({
          eoa: {
            nonce,
            message,
            signature,
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
      }
    },
    [addWallet, isSyncing, login, navigation, syncTokens, track, methodRef]
  );

  const openManageWallet = useCallback(
    ({ title, onSuccess = noop, method = 'add-wallet' }: OpenManageWalletProps) => {
      if (title) {
        setTitle(title);
      }

      if (onSuccess) {
        onSuccessRef.current = onSuccess;
      }

      methodRef.current = method;

      showBottomSheetModal({
        content: (
          <WalletSelectorBottomSheet
            title={title}
            onDismiss={dismissManageWallet}
            onSignedIn={handleOnSignedIn}
            isSigningIn={isSigningIn}
            setIsSigningIn={setIsSigningIn}
          />
        ),
      });
    },
    [dismissManageWallet, handleOnSignedIn, isSigningIn, showBottomSheetModal]
  );

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
      {children}
    </ManageWalletActionsContext.Provider>
  );
});

ManageWalletProvider.displayName = 'ManageWalletProvider';

export default ManageWalletProvider;
