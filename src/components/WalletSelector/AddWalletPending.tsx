import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import Button from 'components/core/Button/Button';
import colors from 'components/core/colors';
import { BodyRegular, TitleMedium } from 'components/core/Text/Text';
import useFetcher from 'contexts/swr/useFetcher';
import { useAuthenticatedUserAddresses } from 'hooks/api/users/useUser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { isWeb3Error, Web3Error } from 'types/Error';
import Spacer from 'components/core/Spacer/Spacer';
import { ADDRESS_ALREADY_CONNECTED, INITIAL, CONFIRM_ADDRESS, PROMPT_SIGNATURE } from 'types/Wallet';
import { useModal } from 'contexts/modal/ModalContext';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import Mixpanel from 'utils/mixpanel';
import { initializeAddWalletPipeline } from './authRequestUtils';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
};

type PendingState = typeof INITIAL | typeof ADDRESS_ALREADY_CONNECTED | typeof CONFIRM_ADDRESS | typeof PROMPT_SIGNATURE;

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function AddWalletPending({ pendingWallet, userFriendlyWalletName, setDetectedError }: Props) {
  const {
    library,
    account,
  } = useWeb3React<Web3Provider>();
  const signer = useMemo(() => library && account ? library.getSigner(account) : undefined, [library, account]);

  const [pendingState, setPendingState] = useState<PendingState>(INITIAL);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetcher = useFetcher();
  const authenticatedUserAddresses = useAuthenticatedUserAddresses();

  const { showModal } = useModal();

  const openManageWalletsModal = useCallback((address: string) => {
    showModal(<ManageWalletsModal newAddress={address}/>);
  }, [showModal]);

  const attemptAddWallet = useCallback(async (address: string, signer: JsonRpcSigner) => {
    try {
      setIsConnecting(true);
      setPendingState(PROMPT_SIGNATURE);
      const { signatureValid } = await initializeAddWalletPipeline({
        address,
        signer,
        fetcher,
        connector: pendingWallet,
        library
      });
      Mixpanel.trackConnectWallet(userFriendlyWalletName, 'Add Wallet');
      openManageWalletsModal(address);
      setIsConnecting(false);

      return signatureValid;
    } catch (error: unknown) {
      setIsConnecting(false);
      if (isWeb3Error(error)) {
        setDetectedError(error);
      }

      // Fall back to generic error message
      if (error instanceof Error) {
        const web3Error: Web3Error = { code: 'AUTHENTICATION_ERROR', ...error };
        setDetectedError(web3Error);
      }
    }
  }, [fetcher, openManageWalletsModal, pendingWallet, userFriendlyWalletName, setDetectedError, library]);

  const isMetamask = useMemo(() => userFriendlyWalletName.toLowerCase() === 'metamask', [userFriendlyWalletName]);
  const isGnosisSafe = useMemo(() => userFriendlyWalletName.toLowerCase() === 'gnosis safe', [userFriendlyWalletName]);

  useEffect(() => {
    async function authenticate() {
      if (account && signer) {
        if (authenticatedUserAddresses.includes(account.toLowerCase())) {
          setPendingState(ADDRESS_ALREADY_CONNECTED);
          return;
        }

        if (isMetamask) {
          // For metamask, prompt the user to confirm the address provided by the extension is the one they want to connect with
          setPendingState(CONFIRM_ADDRESS);
        } else {
          await attemptAddWallet(account.toLowerCase(), signer);
        }
      }
    }

    void authenticate();
  }, [account, signer, authenticatedUserAddresses, attemptAddWallet, isMetamask]);

  if (pendingState === ADDRESS_ALREADY_CONNECTED && account) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={8}/>
        <BodyRegular color={colors.gray50}>The following address is already connected to this account:</BodyRegular>
        <Spacer height={8}/>
        <BodyRegular color={colors.black}>{account.toLowerCase()}</BodyRegular>
        {isMetamask
        && <>
          <Spacer height={8}/>
          <BodyRegular color={colors.gray50}>If you want to connect a different address via Metamask, please switch accounts in the extension and try again.</BodyRegular>
        </>
        }
      </div>);
  }

  // right now we only show this case for Metamask
  if (pendingState === CONFIRM_ADDRESS && account && signer) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        <Spacer height={8}/>
        <BodyRegular color={colors.gray50}>Confirm the following wallet address:</BodyRegular>
        <Spacer height={8}/>
        <BodyRegular color={colors.black}>{account?.toLowerCase()}</BodyRegular>
        <Spacer height={16}/>
        <BodyRegular color={colors.gray50}>If you want to connect a different address via Metamask, please switch accounts in the extension and try again.</BodyRegular>
        <Spacer height={24}/>
        <StyledButton
          text={isConnecting ? 'Connecting...' : 'Confirm'}
          onClick={async () => attemptAddWallet(account.toLowerCase(), signer)}
          disabled={isConnecting}
        />
      </div>);
  }

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <div>
        <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
        {isGnosisSafe
        ? <>
          <Spacer height={8}/>
          <BodyRegular color={colors.gray50}>Connecting with Gnosis requires an on chain transaction.</BodyRegular>
          <Spacer height={8}/>
          <BodyRegular color={colors.gray50}>Follow the prompts in the Gnosis app to sign the message.</BodyRegular>
          <Spacer height={8}/>
          <BodyRegular color={colors.gray50}>Do not close this window.</BodyRegular>
        </>
        : <>
        <Spacer height={8}/>
        <BodyRegular color={colors.gray50}>Sign the message with your wallet.</BodyRegular>

        </>
        }
      </div>
    );
  }

  // Default view for when pendingState === INITIAL
  return (
    <div>
      <TitleMedium>Connect with {userFriendlyWalletName}</TitleMedium>
      <Spacer height={8}/>
      <BodyRegular color={colors.gray50}>Approve your wallet to connect to Gallery.</BodyRegular>
    </div>
  );
}

const StyledButton = styled(Button)`
  align-self: flex-end;
  padding: 16px;
  width: 100%;
  height: 100%;
`;

export default AddWalletPending;
