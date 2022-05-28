import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import Button from 'components/core/Button/Button';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useMintPosterContract } from 'hooks/useContract';
import useWalletModal from 'hooks/useWalletModal';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TransactionStatus } from 'scenes/MembershipMintPage/MembershipMintPage';
import MerkleTree from 'scenes/MembershipMintPage/MerkleTree';
import styled from 'styled-components';

// TODO: Might be a great idea to encapsulated this method from mint page
export default function PosterMintButton() {
  const { active, account: rawAccount, chainId } = useWeb3React<Web3Provider>();

  const account = rawAccount;
  const showWalletModal = useWalletModal();
  const { hideModal } = useModalActions();

  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  const TOKEN_ID = 0;

  const contract = useMintPosterContract();

  // function generateMerkleProof(address: string, allowlist: string[]) {
  //   const merkleTree = new MerkleTree(allowlist);
  //   console.log(merkleTree);
  //   return merkleTree.getHexProof(address);
  // }

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number) => {
      if (contract && account) {
        return contract.mint(tokenId, account.toLowerCase(), []);
      }
    },
    [account, contract]
  );

  useEffect(() => {
    if (active) {
      hideModal();
    }
  }, [active, hideModal]);

  const buttonText = useMemo(() => {
    if (!active) {
      return 'Connect Wallet';
    }

    if (transactionStatus === TransactionStatus.PENDING) {
      return 'Minting...';
    }

    if (transactionStatus === TransactionStatus.SUCCESS) {
      return 'Mint Successful';
    }
    return 'Mint';
    // return canMintToken ? 'Mint Card' : 'Buy on Secondary';
  }, [active, transactionStatus]);

  const handleMintButtonClick = useCallback(async () => {
    // clear any previous errors
    if (error) {
      setError('');
    }

    if (active && contract) {
      // Submit mint transaction
      setTransactionStatus(TransactionStatus.PENDING);
      const mintResult = await mintToken(contract, TOKEN_ID).catch((error: any) => {
        console.log(error);
        setError(`Error while calling contract - "${error?.error?.message ?? error?.message}"`);
        setTransactionStatus(TransactionStatus.FAILED);
      });

      console.log(mintResult);

      if (!mintResult) {
        return;
      }

      if (mintResult.hash) {
        setTransactionHash(mintResult.hash);
      }

      if (typeof mintResult.wait === 'function') {
        // Wait for the transaction to be mined
        const waitResult = await mintResult.wait().catch(() => {
          setTransactionStatus(TransactionStatus.FAILED);
          setError('Transaction failed');
        });
        if (waitResult) {
          setTransactionStatus(TransactionStatus.SUCCESS);
          console.log(`success`);
          //   if (onMintSuccess) {
          //     onMintSuccess();
          //   }
        }
      }
    }
  }, [active, contract, error, mintToken]);

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
