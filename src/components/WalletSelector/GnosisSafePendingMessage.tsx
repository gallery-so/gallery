import Button from 'components/core/Button/Button';
import { BaseM, TitleS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { LISTENING_ONCHAIN, PendingState, PROMPT_SIGNATURE } from 'types/Wallet';
import colors from 'components/core/colors';
import styled, { keyframes } from 'styled-components';
import { useMemo, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { getLocalStorageItem } from 'utils/localStorage';

const GNOSIS_NONCE_STORAGE_KEY = 'gallery_gnosis_nonce';

type Props = {
  pendingState: PendingState;
  userFriendlyWalletName: string;
  onRestartClick?: () => void;
  manuallyValidateSignature: () => void;
};

function GnosisSafeListeningOnChainScreen({
  userFriendlyWalletName,
  manuallyValidateSignature,
}: {
  userFriendlyWalletName: string;
  manuallyValidateSignature: () => void;
}) {
  // Check if the message has been signed every 10seconds so we can be sure to validate the signature in case we miss the SignMsg event
  useEffect(() => {
    const interval = setInterval(() => {
      manuallyValidateSignature();
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [manuallyValidateSignature]);

  return (
    <StyledContentWrapper>
      <TitleS>Connect with {userFriendlyWalletName}</TitleS>
      <Spacer height={24} />
      <BaseM color={colors.metal}>Connecting with Gnosis requires an on-chain transaction.</BaseM>
      <Spacer height={8} />
      <BaseM color={colors.metal}>
        Awaiting confirmation and execution by remaining Gnosis Safe owners.
      </BaseM>
      <Spacer height={24} />
      <StyledLoaderWrapper>
        <StyledLoader />
      </StyledLoaderWrapper>
      <Spacer height={24} />
      <BaseM color={colors.metal}>Do not close this window.</BaseM>
    </StyledContentWrapper>
  );
}

function GnosisSafePendingMessage({
  pendingState,
  userFriendlyWalletName,
  onRestartClick,
  manuallyValidateSignature,
}: Props) {
  const { account } = useWeb3React<Web3Provider>();

  const previousAttemptNonce = useMemo(() => getLocalStorageItem(GNOSIS_NONCE_STORAGE_KEY), []);

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <div>
        <TitleS>Connect with {userFriendlyWalletName}</TitleS>
        <Spacer height={24} />
        <BaseM color={colors.metal}>Connecting with Gnosis requires an on-chain transaction.</BaseM>
        <Spacer height={8} />
        <BaseM color={colors.metal}>
          Follow the prompts in the Gnosis app to sign the message.
        </BaseM>
        <Spacer height={24} />
        <BaseM color={colors.metal}>Do not close this window.</BaseM>
      </div>
    );
  }

  if (pendingState === LISTENING_ONCHAIN) {
    return (
      <GnosisSafeListeningOnChainScreen
        userFriendlyWalletName={userFriendlyWalletName}
        manuallyValidateSignature={manuallyValidateSignature}
      />
    );
  }

  return (
    <StyledContentWrapper>
      <TitleS>Connect with {userFriendlyWalletName}</TitleS>
      <Spacer height={24} />
      {previousAttemptNonce && account ? (
        <>
          <BaseM color={colors.metal}>
            We detected that you previously tried signing a message. Would you like to try
            authenticating again using the same transaction?
          </BaseM>
          <Spacer height={48} />
          <StyledButtonWrapper>
            <Button text="Yes, retry" onClick={manuallyValidateSignature} />
            <Spacer height={8} />
            <StyledRestartButton
              type="secondary"
              text="No, sign new message"
              onClick={onRestartClick}
            />
          </StyledButtonWrapper>
        </>
      ) : (
        <BaseM color={colors.metal}>Approve your wallet to connect to Gallery.</BaseM>
      )}
    </StyledContentWrapper>
  );
}

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledButtonWrapper = styled.div`
  justify-content: space-around;
  display: flex;
  flex-direction: column;
`;

const StyledRestartButton = styled(Button)`
  border: none;
  color: ${colors.metal};
`;

const StyledLoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const loading = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledLoader = styled.div`
  border: 1px solid ${colors.metal};
  border-radius: 50%;
  border-right-color: transparent;
  border-bottom-color: transparent;
  width: 40px;
  height: 40px;
  animation-name: ${loading};
  animation-duration: 1200ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`;

export default GnosisSafePendingMessage;
