import { Web3Provider } from '@ethersproject/providers';
import { captureException } from '@sentry/nextjs';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import { GNOSIS_NONCE_STORAGE_KEY } from '~/constants/storageKeys';
import {
  isNotEarlyAccessError,
  useTrackAddWalletAttempt,
  useTrackAddWalletError,
  useTrackAddWalletSuccess,
} from '~/contexts/analytics/authUtil';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { AddWalletPendingGnosisSafeFragment$key } from '~/generated/AddWalletPendingGnosisSafeFragment.graphql';
import ManageWalletsModal from '~/scenes/Modals/ManageWalletsModal';
import { isWeb3Error, Web3Error } from '~/types/Error';
import {
  ADDRESS_ALREADY_CONNECTED,
  INITIAL,
  LISTENING_ONCHAIN,
  PendingState,
  PROMPT_SIGNATURE,
} from '~/types/Wallet';
import { getLocalStorageItem } from '~/utils/localStorage';
import { removeNullValues } from '~/utils/removeNullValues';

import GnosisSafePendingMessage from '../GnosisSafePendingMessage';
import useAddWallet from '../mutations/useAddWallet';
import useCreateNonce from '../mutations/useCreateNonce';
import {
  listenForGnosisSignature,
  signMessageWithContractAccount,
  validateNonceSignedByGnosis,
} from '../walletUtils';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
  queryRef: AddWalletPendingGnosisSafeFragment$key;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function AddWalletPendingGnosisSafe({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
  queryRef,
}: Props) {
  const { account } = useWeb3React<Web3Provider>();
  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

  const previousAttemptNonce = useMemo(() => getLocalStorageItem(GNOSIS_NONCE_STORAGE_KEY), []);
  const [nonce, setNonce] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [authenticationFlowStarted, setAuthenticationFlowStarted] = useState(false);

  const query = useFragment(
    graphql`
      fragment AddWalletPendingGnosisSafeFragment on Query {
        viewer {
          ... on Viewer {
            user {
              wallets {
                chainAddress @required(action: NONE) {
                  address
                }
              }
            }
          }
        }

        ...ManageWalletsModalFragment
      }
    `,
    queryRef
  );

  const { viewer } = query;

  const authenticatedUserAddresses = useMemo(
    () => removeNullValues(viewer?.user?.wallets?.map((wallet) => wallet?.chainAddress.address)),
    [viewer?.user?.wallets]
  );

  const { showModal } = useModalActions();

  const openManageWalletsModal = useCallback(
    (address: string) => {
      showModal({
        content: <ManageWalletsModal queryRef={query} newAddress={address} />,
        headerText: 'Connect your wallet',
      });
    },
    [query, showModal]
  );

  const trackAddWalletAttempt = useTrackAddWalletAttempt();
  const trackAddWalletSuccess = useTrackAddWalletSuccess();
  const trackAddWalletError = useTrackAddWalletError();

  const handleError = useCallback(
    (error: unknown) => {
      trackAddWalletError('Gnosis Safe', error);
      if (isWeb3Error(error)) {
        if (!isNotEarlyAccessError(error.message)) {
          captureException(error.message);
        }
        setDetectedError(error);
      }

      // Fall back to generic error message
      if (error instanceof Error) {
        captureException(error);
        const web3Error: Web3Error = { code: 'AUTHENTICATION_ERROR', ...error };
        setDetectedError(web3Error);
      }
    },
    [setDetectedError, trackAddWalletError]
  );

  const addWallet = useAddWallet();
  const authenticateWithBackend = useCallback(
    async (address: string, nonce: string) => {
      const { signatureValid } = await addWallet({
        chainAddress: {
          address,
          chain: 'Ethereum',
        },
        authMechanism: {
          gnosisSafe: {
            address,
            nonce,
          },
        },
      });

      if (!signatureValid) {
        throw new Error('Signature is not valid');
      }

      trackAddWalletSuccess('Gnosis Safe');
      openManageWalletsModal(address);
    },
    [addWallet, openManageWalletsModal, trackAddWalletSuccess]
  );

  // Initiates the full authentication flow including signing the message, listening for the signature, validating it. then calling the backend
  // This is the default flow
  const attemptAddWallet = useCallback(
    async (address: string, nonce: string, userExists: boolean) => {
      try {
        if (userExists) {
          throw { code: 'EXISTING_USER' } as Web3Error;
        }

        setPendingState(PROMPT_SIGNATURE);
        trackAddWalletAttempt('Gnosis Safe');
        await signMessageWithContractAccount(address, nonce, pendingWallet);
        window.localStorage.setItem(GNOSIS_NONCE_STORAGE_KEY, JSON.stringify(nonce));

        setPendingState(LISTENING_ONCHAIN);
        await listenForGnosisSignature(address, nonce, pendingWallet);

        await authenticateWithBackend(address, nonce);
      } catch (error: unknown) {
        handleError(error);
      }
    },
    [trackAddWalletAttempt, pendingWallet, authenticateWithBackend, handleError]
  );

  // Validates the signature on-chain. If it hasnt been signed yet, initializes a listener to wait for the SignMsg event.
  // This is used in 2 cases:
  // 1. The user has previously tried to sign a message, and they opted to retry using the same nonce+transaction
  // 2. This gets automatically called on an interval as a backup to validate the signature in case the listener fails to detect the SignMsg event
  const manuallyValidateSignature = useCallback(async () => {
    if (!account) {
      return;
    }

    try {
      // Immediately check if the message has already been signed and executed on chain
      const wasSigned = await validateNonceSignedByGnosis(account, nonce, pendingWallet);
      if (wasSigned) {
        await authenticateWithBackend(account, nonce);
      }

      // If it hasn't, set up a listener because the transaction may not have been executed yet
      if (pendingState !== LISTENING_ONCHAIN) {
        setPendingState(LISTENING_ONCHAIN);
        await listenForGnosisSignature(account, nonce, pendingWallet);
        // Once signed, call the backend as usual
        void authenticateWithBackend(account, nonce);
      }
    } catch (error: unknown) {
      handleError(error);
    }
  }, [account, authenticateWithBackend, handleError, pendingWallet, pendingState, nonce]);

  const restartAuthentication = useCallback(async () => {
    if (account) {
      await attemptAddWallet(account.toLowerCase(), nonce, userExists);
    }
  }, [account, attemptAddWallet, nonce, userExists]);

  const createNonce = useCreateNonce();

  // This runs once to auto-initiate the authentication flow, when wallet is first connected (ie when 'account' is defined)
  useEffect(() => {
    if (authenticationFlowStarted) {
      return;
    }

    async function initiateAuthentication() {
      if (account) {
        setAuthenticationFlowStarted(true);

        try {
          if (authenticatedUserAddresses.includes(account.toLowerCase())) {
            setPendingState(ADDRESS_ALREADY_CONNECTED);
            return;
          }

          const { nonce, user_exists: userExists } = await createNonce(account, 'Ethereum');
          setNonce(nonce);
          setUserExists(userExists);

          if (nonce === previousAttemptNonce) {
            return;
          }

          await attemptAddWallet(account.toLowerCase(), nonce, userExists);
        } catch (error: unknown) {
          handleError(error);
        }
      }
    }

    void initiateAuthentication();
  }, [
    account,
    authenticatedUserAddresses,
    attemptAddWallet,
    authenticationFlowStarted,
    handleError,
    previousAttemptNonce,
    createNonce,
  ]);

  if (pendingState === ADDRESS_ALREADY_CONNECTED && account) {
    return (
      <VStack gap={8}>
        <TitleS>Connect with {userFriendlyWalletName}</TitleS>
        <BaseM>The following address is already connected to this account:</BaseM>
        <BaseM color={colors.offBlack}>{account.toLowerCase()}</BaseM>
      </VStack>
    );
  }

  return (
    <GnosisSafePendingMessage
      pendingState={pendingState}
      userFriendlyWalletName={userFriendlyWalletName}
      onRestartClick={restartAuthentication}
      manuallyValidateSignature={manuallyValidateSignature}
    />
  );
}

export default AddWalletPendingGnosisSafe;
