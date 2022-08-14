import { Contract } from '@ethersproject/contracts';
import { useConnectEthereum } from 'components/WalletSelector/multichain/useConnectEthereum';
import { TransactionStatus } from 'constants/transaction';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

type Props = {
  contract: Contract | null;
  tokenId: number;
  onMintSuccess?: () => void;
  quantity: number;
};

/**
 * Hook that contains business logic related to connecting a wallet and minting
 */
export default function useMintContractWithQuantity({
  contract,
  tokenId,
  onMintSuccess,
  quantity,
}: Props) {
  const { address: rawAddress, isConnected: active } = useAccount();
  const [error, setError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');

  const address = rawAddress?.toLowerCase();

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number, quantity: number) => {
      if (contract && address) {
        return contract.mint(address, tokenId, quantity, []);
      }
    },
    [address]
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

  const connectEthereum = useConnectEthereum();

  // disconnect on mount to start with blank slate
  const { disconnect } = useDisconnect();
  useEffect(() => {
    disconnect();
  }, [disconnect]);

  const handleConnectWalletButtonClick = useCallback(async () => {
    try {
      const address = await connectEthereum();
      console.log('connected address', address);
    } catch (error: unknown) {
      console.log('error conecting', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }, [connectEthereum]);

  const handleClick = useCallback(() => {
    active ? handleMintButtonClick() : handleConnectWalletButtonClick();
  }, [active, handleConnectWalletButtonClick, handleMintButtonClick]);

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
    active,
    address,
    transactionStatus,
    transactionHash,
    error,
    handleClick,
    buttonText,
  };
}
