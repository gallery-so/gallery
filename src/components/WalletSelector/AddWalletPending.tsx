import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { BodyRegular, TitleMedium } from 'components/core/Text/Text';
import { useAuthActions } from 'contexts/auth/AuthContext';
import useFetcher from 'contexts/swr/useFetcher';
import { useAuthenticatedUserAddresses } from 'hooks/api/users/useUser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { isWeb3Error, Web3Error } from 'types/Error';
import Spacer from 'components/core/Spacer/Spacer';
import { ADDRESS_ALREADY_CONNECTED, INITIAL, CONFIRM_ADDRESS, PROMPT_SIGNATURE } from 'types/Wallet';
import initializeAuthPipeline, { initializeAddWalletPipeline } from './authRequestUtils';

type Props = {
  pendingWalletName: string;
  pendingWallet: AbstractConnector;
  onConnectSuccess?: () => void;
  setDetectedError: (error: Web3Error) => void;
};

type PendingState = typeof INITIAL | typeof ADDRESS_ALREADY_CONNECTED | typeof CONFIRM_ADDRESS | typeof PROMPT_SIGNATURE;

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function WalletPending({ pendingWallet, pendingWalletName, onConnectSuccess, setDetectedError }: Props) {
  const {
    library,
    account,
  } = useWeb3React<Web3Provider>();
  const signer = useMemo(() => library && account ? library.getSigner(account) : undefined, [library, account]);

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);

  const fetcher = useFetcher();
  const { logIn } = useAuthActions();
  const authenticatedUserAddresses = useAuthenticatedUserAddresses();

  const attemptAuthentication = useCallback(async (address: string, signer: JsonRpcSigner) => {
    const { jwt, userId } = await initializeAuthPipeline({
      address,
      signer,
      fetcher,
      connector: pendingWallet,
    });
      // Mixpanel.trackConnectWallet(pendingWalletName);
    logIn({ jwt, userId });
  }, [fetcher, logIn, pendingWallet]);

  const attemptAddWallet = useCallback(async (address: string, signer: JsonRpcSigner) => {
    try {
      const { signatureValid } = await initializeAddWalletPipeline({
        address,
        signer,
        fetcher,
        connector: pendingWallet,
      });
      return signatureValid;
    } catch (error: unknown) {
      if (isWeb3Error(error)) {
        console.log('here', error);
        setDetectedError(error);
      }

      // Fall back to generic error message
      if (error instanceof Error) {
        const web3Error: Web3Error = { code: 'AUTHENTICATION_ERROR', ...error };
        setDetectedError(web3Error);
      }
    }
  }, [fetcher, pendingWallet, setDetectedError]);

  useEffect(() => {
    async function authenticate() {
      // TODO: when hooking up to the server, make sure this only runs a single time
      if (account && signer && pendingWallet) {
        // try {
        const address = account.toLowerCase();
        console.log('address', address);

        if (authenticatedUserAddresses.includes(address)) {
          setPendingState(ADDRESS_ALREADY_CONNECTED);
        } else if (pendingWalletName.toLowerCase() === 'metamask') {
          setPendingState(CONFIRM_ADDRESS);
        } else {
          setPendingState(PROMPT_SIGNATURE)
          await attemptAddWallet(account.toLowerCase(), signer);
          if (onConnectSuccess) {
            onConnectSuccess();
          }
        }

        // if (onConnectSuccess) {
        //   onConnectSuccess();
        // }
      }
    }

    void authenticate();
  }, [account, logIn, signer, fetcher, pendingWalletName, pendingWallet, onConnectSuccess, setDetectedError, attemptAuthentication, authenticatedUserAddresses, attemptAddWallet]);

  if (pendingState === ADDRESS_ALREADY_CONNECTED) {
    return (
      <div>
        <StyledTitleMedium>Connect with {pendingWalletName}</StyledTitleMedium>
        <BodyRegular color={colors.black}>{account?.toLowerCase()}</BodyRegular>
        <BodyRegular color={colors.gray50}>The provided address is already connected to this account.</BodyRegular>
        <BodyRegular color={colors.gray50}>If you want to connect a different address via Metamask, please switch accounts in the extension and try again.</BodyRegular>
      </div>);
  }

  if (pendingState === CONFIRM_ADDRESS && account && signer) {
    return (
      <div>
        <StyledTitleMedium>Connect with {pendingWalletName}</StyledTitleMedium>
        <BodyRegular color={colors.gray50}>Confirm the following wallet address:</BodyRegular>
        <BodyRegular color={colors.black}>{account?.toLowerCase()}</BodyRegular>
        <Spacer height={16}/>
        <BodyRegular color={colors.gray50}>If you want to connect a different address via Metamask, please switch accounts in the extension and try again.</BodyRegular>
        <Spacer height={24}/>
        <StyledButton
          text="Confirm"
          onClick={async () => attemptAddWallet(account.toLowerCase(), signer)}
        />
      </div>);
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <StyledAddWalletPending>
        <StyledTitleMedium>Connect with {pendingWalletName}</StyledTitleMedium>
        <BodyRegular color={colors.gray50}>Sign the message with your wallet.</BodyRegular>
      </StyledAddWalletPending>
    );
  }

  return (
    <StyledAddWalletPending>
      <StyledTitleMedium>Connect with {pendingWalletName}</StyledTitleMedium>
      <BodyRegular color={colors.gray50}>Approve your wallet to connect to Gallery.</BodyRegular>
    </StyledAddWalletPending>
  );
}

const StyledTitleMedium = styled(TitleMedium)`
  line-height: initial;
  font-size: 18px;

  margin-bottom: 16px;
`;

const StyledAddWalletPending = styled.div`
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;
export default WalletPending;
