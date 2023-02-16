import { Contract } from '@ethersproject/contracts';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import ErrorText from '~/components/core/Text/ErrorText';
import { BaseM } from '~/components/core/Text/Text';
import { TransactionStatus } from '~/constants/transaction';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { useMintMementosContract } from '~/hooks/useContract';
import useMintContract from '~/hooks/useMintContract';

import useMintPhase from './useMintPhase';

type Props = {
  onMintSuccess: () => void;
};

const WHITE_RHINO_ALLOWLIST =
  'https://storage.googleapis.com/gallery-prod-325303.appspot.com/white-rhino-allowlist.json';

export default function MintButton({ onMintSuccess }: Props) {
  const { pushToast } = useToastActions();

  const tokenId = 1;

  const { data: allowlist } = useSWR(WHITE_RHINO_ALLOWLIST);

  const contract = useMintMementosContract();
  const {
    transactionHash,
    transactionStatus,
    buttonText: mintButtonText,
    error,
    handleClick,
  } = useMintContract({
    contract: contract as Contract | null,
    tokenId,
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
    if (phase === 'pre-mint') return 'Mint Unavailable';
    if (phase === 'active-mint') return mintButtonText;
    return 'Mint Ended';
  }, [mintButtonText, phase]);

  const isDisabled =
    phase === 'pre-mint' ||
    phase === 'active-mint' ||
    transactionStatus === TransactionStatus.PENDING;

  return (
    <>
      <StyledButton onClick={handleClick} disabled={isDisabled}>
        {buttonText}
      </StyledButton>
      {transactionHash && (
        <>
          <BaseM>
            {transactionStatus === TransactionStatus.SUCCESS
              ? 'Transaction successful!'
              : 'Transaction submitted. This may take several minutes.'}
          </BaseM>
          <GalleryLink href={`https://etherscan.io/tx/${transactionHash}`}>
            <BaseM>View on Etherscan</BaseM>
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
