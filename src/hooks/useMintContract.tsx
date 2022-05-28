import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useCallback, useMemo, useState } from 'react';
import { TransactionStatus } from 'scenes/MembershipMintPage/MembershipMintPage';
import MerkleTree from 'scenes/MembershipMintPage/MerkleTree';

type Props = {
  contract: Contract | null;
  tokenId: number;
};

export default function useMintContract({ contract, tokenId }: Props) {
  const { active, account: rawAccount, chainId } = useWeb3React<Web3Provider>();
  const [error, setError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');

  const account = rawAccount?.toLowerCase();

  function generateMerkleProof(address: string, allowlist: string[]) {
    const merkleTree = new MerkleTree(allowlist);
    console.log(merkleTree);
    return merkleTree.getHexProof(address);
  }

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number) => {
      if (contract && account) {
        return contract.mint(tokenId, account, []);
      }
    },
    [account, contract]
  );

  const handleMintButtonClick = useCallback(async () => {
    // clear any previous errors
    if (error) {
      setError('');
    }

    if (active && contract) {
      // Submit mint transaction
      setTransactionStatus(TransactionStatus.PENDING);
      const mintResult = await mintToken(contract, tokenId).catch((error: any) => {
        console.log(error);
        setError(`Error while calling contract - "${error?.error?.message ?? error?.message}"`);
        setTransactionStatus(TransactionStatus.FAILED);
      });

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

  return {
    transactionStatus,
    transactionHash,
    error,
    handleMintButtonClick,
    buttonText,
  };
}
