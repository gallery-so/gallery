import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack } from '~/components/core/Spacer/Stack';
import ErrorText from '~/components/core/Text/ErrorText';
import { BaseM } from '~/components/core/Text/Text';
import { TransactionStatus } from '~/constants/transaction';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { useMintMementosContract, WagmiContract } from '~/hooks/useContract';
import useMintContract from '~/hooks/useMintContract';
import CircleMinusIcon from '~/icons/CircleMinusIcon';
import CirclePlusIcon from '~/icons/CirclePlusIcon';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

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
    quantity,
    setQuantity,
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
      <HStack justify="space-between">
        <BaseM>
          <strong>Quantity</strong>
        </BaseM>
        <HStack align="center" gap={8}>
          <StyledAdjustQuantityButton
            onClick={() => {
              setQuantity(quantity - 1);
            }}
            disabled={quantity <= 1}
          >
            <CircleMinusIcon />
          </StyledAdjustQuantityButton>
          <BaseM>{quantity}</BaseM>
          <StyledAdjustQuantityButton
            onClick={() => {
              setQuantity(quantity + 1);
            }}
          >
            <CirclePlusIcon />
          </StyledAdjustQuantityButton>
        </HStack>
      </HStack>
      <HStack justify="space-between">
        <BaseM>
          <strong>Total Price</strong>
        </BaseM>
        <HStack align="center">
          <BaseM>{quantity * 0.000777} Ξ</BaseM>
        </HStack>
      </HStack>
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
          <GalleryLink href={`https://basescan.org/tx/${transactionHash}`}>
            <BaseM>View on Basescan</BaseM>
          </GalleryLink>
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

const StyledAdjustQuantityButton = styled.button<{ disabled?: boolean }>`
  font-size: 16px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  border: 0;
  padding: 0;
  background: none;

  path {
    stroke: ${({ disabled }) => (disabled ? `${colors.porcelain}` : 'auto')};
  }

  cursor: ${({ disabled }) => (disabled ? `default` : 'pointer')};
`;
