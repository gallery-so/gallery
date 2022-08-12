import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BaseM } from 'components/core/Text/Text';
import { useModalActions } from 'contexts/modal/ModalContext';
import useWalletModal from 'hooks/useWalletModal';
import { useCallback, useEffect, useMemo } from 'react';
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
  const { active } = useWeb3React<Web3Provider>();

  const showWalletModal = useWalletModal();
  const { pushToast } = useToastActions();

  // const tokenId = NFT_TOKEN_ID;

  const contract = useMintMerchContract();
  // console.log(contract);
  const { transactionHash, transactionStatus, buttonText, error, handleMintButtonClick } =
    useMintContractWithQuantity({
      contract,
      tokenId,
      quantity,
    });

  // console.log(contract);

  useEffect(() => {
    if (active) {
      console.log('hide modal here');
      // hideModal();
    }
  }, [
    active,
    // hideModal
  ]);

  const handleConnectWalletButtonClick = useCallback(() => {
    if (!active) {
      // FIXME: This will close the main modal page, because only one modal can be open at a time.
      showWalletModal();
    }
  }, [active, showWalletModal]);

  const handleOnClick = () => {
    active ? handleMintButtonClick() : handleConnectWalletButtonClick();
  };

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
      <StyledButton onClick={handleOnClick} disabled={false}>
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
