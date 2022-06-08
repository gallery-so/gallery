import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { BaseM } from 'components/core/Text/Text';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { NFT_TOKEN_ID } from 'constants/poster';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useMintPosterContract } from 'hooks/useContract';
import useMintContract from 'hooks/useMintContract';
import useWalletModal from 'hooks/useWalletModal';
import { useCallback, useEffect, useMemo } from 'react';
import { TransactionStatus } from 'constants/transaction';
import styled from 'styled-components';
import { useToastActions } from 'contexts/toast/ToastContext';

type Props = {
  onMintSuccess: () => void;
};

export default function PosterMintButton({ onMintSuccess }: Props) {
  const { active } = useWeb3React<Web3Provider>();

  const showWalletModal = useWalletModal();
  const { hideModal } = useModalActions();
  const { pushToast } = useToastActions();

  const tokenId = NFT_TOKEN_ID;

  const contract = useMintPosterContract();
  const { transactionHash, transactionStatus, buttonText, error, handleMintButtonClick } =
    useMintContract({
      contract,
      tokenId,
    });

  useEffect(() => {
    if (active) {
      hideModal();
    }
  }, [active, hideModal]);

  const handleConnectWalletButtonClick = useCallback(() => {
    if (!active) {
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
        message: 'You’ve successfully minted 2022 Community Poster.',
        autoClose: true,
      });
    }
  }, [transactionStatus, pushToast, onMintSuccess]);

  const isButtonDisabled = useMemo(() => {
    return transactionStatus === TransactionStatus.PENDING;
  }, [transactionStatus]);

  return (
    <>
      <StyledButton onClick={handleOnClick} text={buttonText} disabled={isButtonDisabled} />
      {transactionHash && (
        <BaseM>
          {transactionStatus === TransactionStatus.SUCCESS
            ? 'Transaction successful! '
            : 'Transaction submitted. This may take several minutes. '}

          <InteractiveLink href={`https://etherscan.io/tx/${transactionHash}`}>
            View on Etherscan
          </InteractiveLink>
        </BaseM>
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
