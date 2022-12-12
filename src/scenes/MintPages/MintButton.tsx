import { Contract } from '@ethersproject/contracts';
import { useEffect } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import ErrorText from '~/components/core/Text/ErrorText';
import { BaseM } from '~/components/core/Text/Text';
import { TransactionStatus } from '~/constants/transaction';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { useMintMementosContract } from '~/hooks/useContract';
import useMintContract from '~/hooks/useMintContract';

type Props = {
  onMintSuccess: () => void;
};

export default function MintButton({ onMintSuccess }: Props) {
  const { pushToast } = useToastActions();

  const tokenId = 1;

  const contract = useMintMementosContract();
  const { transactionHash, transactionStatus, buttonText, error, handleClick } = useMintContract({
    contract: contract as Contract | null,
    tokenId,
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

  return (
    <>
      <StyledButton
        onClick={handleClick}
        disabled={transactionStatus === TransactionStatus.PENDING}
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
