import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import Button from 'components/core/Button/Button';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { NFT_TOKEN_ID } from 'constants/poster';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useMintPosterContract } from 'hooks/useContract';
import useMintContract from 'hooks/useMintContract';
import useWalletModal from 'hooks/useWalletModal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TransactionStatus } from 'scenes/MembershipMintPage/MembershipMintPage';
import styled from 'styled-components';

// TODO: Might be a great idea to encapsulated this method from mint page
export default function PosterMintButton() {
  const { active } = useWeb3React<Web3Provider>();

  const showWalletModal = useWalletModal();
  const { hideModal } = useModalActions();

  const tokenId = NFT_TOKEN_ID;

  const contract = useMintPosterContract();
  const {
    transactionHash,
    transactionStatus,
    error,
    buttonText,
    handleMintButtonClick,
  } = useMintContract({
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

  return (
    <>
      <StyledButton onClick={handleOnClick} text={buttonText}></StyledButton>
      {transactionHash && (
        <>
          <Spacer height={16} />
          <div>
            <BaseM>
              {transactionStatus === TransactionStatus.SUCCESS
                ? 'Transaction successful!'
                : 'Transaction submitted. This may take several minutes.'}
            </BaseM>
            <GalleryLink href={`https://etherscan.io/tx/${transactionHash}`}>
              <BaseM>View on Etherscan</BaseM>
            </GalleryLink>
          </div>
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
