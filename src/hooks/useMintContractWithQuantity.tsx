import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { TransactionStatus } from 'constants/transaction';
import { useCallback, useMemo, useState } from 'react';

type Props = {
  contract: Contract | null;
  tokenId: number;
  onMintSuccess?: () => void;
  quantity: number;
};

export default function useMintContract({ contract, tokenId, onMintSuccess, quantity }: Props) {
  const { active, account: rawAccount } = useWeb3React<Web3Provider>();
  const [error, setError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');

  const account = rawAccount?.toLowerCase();

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number, quantity: number) => {
      if (contract && account) {
        return contract.mint(account, tokenId, quantity, []);
      }
    },
    [account]
  );

  const handleMintButtonClick = useCallback(async () => {
    // clear any previous errors
    if (error) {
      setError('');
    }

    if (active && contract) {
      // Submit mint transaction
      setTransactionStatus(TransactionStatus.PENDING);
      const mintResult = await mintToken(contract, tokenId, quantity).catch((error: any) => {
        // console.log(error.message, error.error.message);
        // TODO: Can handle additional errors here if we want
        if (error.error.message === 'execution reverted: Merch: not allowlisted') {
          setError(
            `Your address is not on the allowlist. Please check back when public mint is live.`
          );
        } else {
          setError(`Error while calling contract - "${error?.error?.message ?? error?.message}"`);
        }
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
          if (onMintSuccess) {
            onMintSuccess();
          }
        }
      }
    }
  }, [active, contract, error, mintToken, onMintSuccess, tokenId, quantity]);

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
  }, [active, transactionStatus]);

  return {
    transactionStatus,
    transactionHash,
    error,
    handleMintButtonClick,
    buttonText,
  };
}
