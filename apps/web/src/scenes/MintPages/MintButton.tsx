import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { Button } from '~/components/core/Button/Button';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import ErrorText from '~/components/core/Text/ErrorText';
import { BaseM } from '~/components/core/Text/Text';
import { TransactionStatus } from '~/constants/transaction';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { useMintMementosContract, WagmiContract } from '~/hooks/useContract';
import useMintContract from '~/hooks/useMintContract';
import { contexts } from '~/shared/analytics/constants';

import { ALLOWLIST_URL, MEMENTOS_NFT_TOKEN_ID } from './config';
import useMintPhase from './useMintPhase';

type Props = {
  onMintSuccess: () => void;
};

export default function MintButton({ onMintSuccess }: Props) {
  const { pushToast } = useToastActions();

  const { data: allowlist } = useSWR(ALLOWLIST_URL);

  const contract = useMintMementosContract();
  const {
    transactionHash,
    transactionStatus,
    buttonText: mintButtonText,
    error,
    handleClick,
  } = useMintContract({
    contract: contract as WagmiContract | null,
    tokenId: MEMENTOS_NFT_TOKEN_ID,
    allowlist,
  });

  useEffect(() => {
    if (transactionStatus === TransactionStatus.SUCCESS) {
      onMintSuccess();
      pushToast({
        message: 'You’ve succesfully minted the commemorative token.',
        autoClose: true,
      });
    }
  }, [transactionStatus, pushToast, onMintSuccess]);

  const phase = useMintPhase();
  const buttonText = useMemo(() => {
    if (phase === 'pre-mint') return 'Minting Soon™';
    if (phase === 'active-mint') return mintButtonText;
    return 'Mint Ended';
  }, [mintButtonText, phase]);

  const isDisabled =
    phase === 'pre-mint' ||
    phase === 'post-mint' ||
    transactionStatus === TransactionStatus.PENDING;

  return (
    <>
      <StyledButton
        eventElementId="Mint Memento Button"
        eventName="Mint Memento"
        eventContext={contexts.Mementos}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {buttonText}
      </StyledButton>
      {transactionHash && (
        <>
          <BaseM>
            {transactionStatus === TransactionStatus.SUCCESS
              ? 'Transaction successful!'
              : 'Transaction submitted. This may take several minutes.'}
          </BaseM>
          {/* MintButton is currently only used for Mementos, which is now on Base. */}
          <InteractiveLink href={`https://basescan.org/tx/${transactionHash}`}>
            <BaseM>View on Basescan</BaseM>
          </InteractiveLink>
        </>
      )}
      {transactionStatus === TransactionStatus.SUCCESS && (
        <BaseM>It should be in your wallet at the moment</BaseM>
      )}
      {error && <StyledErrorText message={error} />}
    </>
  );
}

const StyledButton = styled(Button)`
  align-self: flex-end;
  width: 100%;
  height: 100%;
  padding: 12px 24px;
  text-decoration: none;
`;

const StyledErrorText = styled(ErrorText)`
  // prevents long error messages from overflowing
  word-break: break-word;
`;
