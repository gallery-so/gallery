import { Button } from 'components/core/Button/Button';
import { BaseM } from 'components/core/Text/Text';
import { LISTENING_ONCHAIN, PendingState, PROMPT_SIGNATURE } from 'types/Wallet';
import colors from 'components/core/colors';
import styled, { keyframes } from 'styled-components';
import { useMemo, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { getLocalStorageItem } from 'utils/localStorage';
import { VStack } from 'components/core/Spacer/Stack';
import { EmptyState } from 'components/EmptyState/EmptyState';

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
    <EmptyState title={`Connect with ${userFriendlyWalletName}`}>
      <VStack gap={24}>
        <VStack>
          <BaseM>Connecting with Gnosis requires an on-chain transaction.</BaseM>
          <BaseM>Awaiting confirmation and execution by remaining Gnosis Safe owners.</BaseM>
        </VStack>
        <StyledLoaderWrapper>
          <StyledLoader />
        </StyledLoaderWrapper>
        <BaseM>Do not close this window.</BaseM>
      </VStack>
    </EmptyState>
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

  const title = `Connect with ${userFriendlyWalletName}`;

  if (pendingState === PROMPT_SIGNATURE) {
    return (
      <EmptyState title={title}>
        <VStack gap={24}>
          <VStack>
            <BaseM>Connecting with Gnosis requires an on-chain transaction.</BaseM>
            <BaseM>Follow the prompts in the Gnosis app to sign the message.</BaseM>
          </VStack>
          <BaseM>Do not close this window.</BaseM>
        </VStack>
      </EmptyState>
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

  return previousAttemptNonce && account ? (
    <EmptyState
      title={title}
      description="We detected that you previously tried signing a message. Would you like to try authenticating again using the same transaction?"
    >
      <StyledButtonWrapper gap={8} align="center" justify="space-around">
        <Button onClick={manuallyValidateSignature}>Yes, retry</Button>
        <StyledRestartButton onClick={onRestartClick}>No, sign new message</StyledRestartButton>
      </StyledButtonWrapper>
    </EmptyState>
  ) : (
    <EmptyState title={title} description="Approve your wallet to connect to Gallery." />
  );
}

const StyledButtonWrapper = styled(VStack)`
  padding-top: 24px;
`;

const StyledRestartButton = styled(Button).attrs({ variant: 'secondary' })`
  border-color: transparent;
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
