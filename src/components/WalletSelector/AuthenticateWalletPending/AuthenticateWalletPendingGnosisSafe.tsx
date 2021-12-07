import { useCallback, useEffect, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import colors from 'components/core/colors';
import { BodyRegular, TitleMedium } from 'components/core/Text/Text';
import { useAuthActions } from 'contexts/auth/AuthContext';
import useFetcher from 'contexts/swr/useFetcher';
import { isWeb3Error, Web3Error } from 'types/Error';
import { INITIAL, PROMPT_SIGNATURE, PendingState, LISTENING_ONCHAIN } from 'types/Wallet';
import Mixpanel from 'utils/mixpanel';
import Spacer from 'components/core/Spacer/Spacer';
import { fetchNonce, loginOrCreateUser } from '../authRequestUtils';
import {
  getWalletTypeId,
  listenForGnosisSignature,
  signMessageWithContractAccount,
} from '../walletUtils';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
};

function AuthenticateWalletPendingGnosisSafe({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
}: Props) {
  const { library, account } = useWeb3React<Web3Provider>();

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

  const fetcher = useFetcher();
  const { logIn } = useAuthActions();

  const attemptAuthentication = useCallback(
    async (address: string) => {
      setPendingState(PROMPT_SIGNATURE);

      const { nonce, user_exists: userExists } = await fetchNonce(address, fetcher);
      const signature = await signMessageWithContractAccount(
        address,
        nonce,
        pendingWallet,
        library
      );

      setPendingState(LISTENING_ONCHAIN);

      await listenForGnosisSignature(address, nonce, library);

      const payload = {
        signature,
        address,
        wallet_type: getWalletTypeId(pendingWallet),
        nonce,
      };

      const { jwt, userId } = await loginOrCreateUser(userExists, payload, fetcher);

      Mixpanel.trackConnectWallet(userFriendlyWalletName, 'Sign In');
      logIn({ jwt, userId }, address);
    },
    [fetcher, library, logIn, pendingWallet, userFriendlyWalletName]
  );

  useEffect(() => {
    async function authenticate() {
      if (account) {
        try {
          await attemptAuthentication(account.toLowerCase());
        } catch (error: unknown) {
          if (isWeb3Error(error)) {
            setDetectedError(error);
          }

          // Fall back to generic error message
          if (error instanceof Error) {
            const web3Error: Web3Error = { code: 'AUTHENTICATION_ERROR', ...error };
            setDetectedError(web3Error);
          }
        }
      }
    }

    void authenticate();
  }, [account, setDetectedError, attemptAuthentication]);

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={24} />
        <BodyRegular color={colors.gray50}>
          Connecting with Gnosis requires an on chain transaction.
        </BodyRegular>
        <Spacer height={8} />
        <BodyRegular color={colors.gray50}>
          Follow the prompts in the Gnosis Safe app to submit a transaction to sign the message.
        </BodyRegular>
        <Spacer height={32} />
        <BodyRegular color={colors.gray50}>Do not close this window.</BodyRegular>
      </div>
    );
  }

  if (pendingState === LISTENING_ONCHAIN) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={24} />
        <BodyRegular color={colors.gray50}>
          Connecting with Gnosis requires an on chain transaction.
        </BodyRegular>
        <Spacer height={8} />
        <BodyRegular color={colors.gray50}>
          Transaction submitted - this must now be confirmed and executed by the Gnosis Safe owners.
        </BodyRegular>
        <Spacer height={32} />
        <BodyRegular color={colors.gray50}>Waiting for transaction execution...</BodyRegular>
        <Spacer height={8} />
        <BodyRegular color={colors.gray50}>Do not close this window.</BodyRegular>
      </div>
    );
  }

  return (
    <div>
      <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
      <Spacer height={8} />
      <BodyRegular color={colors.gray50}>Approve your wallet to connect to Gallery.</BodyRegular>
    </div>
  );
}

export default AuthenticateWalletPendingGnosisSafe;
