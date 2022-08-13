import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BaseM } from 'components/core/Text/Text';
import { useEffect, useMemo } from 'react';
import { useToastActions } from 'contexts/toast/ToastContext';
import { TransactionStatus } from 'constants/transaction';
import useMintContractWithQuantity from 'hooks/useMintContractWithQuantity';
import { useMintMerchContract } from 'hooks/useContract';
import { NFT_TOKEN_ID } from 'constants/merch';
import { Button } from 'components/core/Button/Button';
import styled from 'styled-components';

type Props = {
  onMintSuccess: () => void;
  quantity: number;
  tokenId: number;
};

export default function MintButton({ onMintSuccess, quantity, tokenId }: Props) {
  const { pushToast } = useToastActions();

  // const tokenId = NFT_TOKEN_ID;

  const contract = useMintMerchContract();
  const { active, address, transactionHash, transactionStatus, buttonText, error, handleClick } =
    useMintContractWithQuantity({
      contract,
      tokenId,
      quantity,
    });

  useEffect(() => {
    if (transactionStatus === TransactionStatus.SUCCESS) {
      onMintSuccess();
      pushToast({
        message: 'You’ve succesfully minted 2022 Community Poster.',
        autoClose: true,
      });
    }
  }, [transactionStatus, pushToast, onMintSuccess]);

  const isButtonDisabled = useMemo(() => {
    return transactionStatus === TransactionStatus.PENDING;
  }, [transactionStatus]);

  return (
    <>
      <StyledButton onClick={handleClick} disabled={false}>
        {buttonText}
      </StyledButton>
      {address && !transactionHash && <BaseM>Connected address: {address}</BaseM>}
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
        <>
          <BaseM>It should be in your wallet at the moment</BaseM>
        </>
      )}
      {error && (
        <>
          <Spacer height={16} />
          <ErrorText message={error} />
        </>
      )}
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
