import { Contract } from '@ethersproject/contracts';
import { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectEthereum } from '~/components/WalletSelector/multichain/useConnectEthereum';
import { TransactionStatus } from '~/constants/transaction';

type Props = {
  contract: Contract | null;
  tokenId: number;
  onMintSuccess?: () => void;
};

export default function useMintContract({ contract, tokenId, onMintSuccess }: Props) {
  const { address: rawAddress, isConnected: active } = useAccount();

  const [error, setError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');

  const address = rawAddress?.toLowerCase();

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number) => {
      if (contract && address) {
        return contract.mint(tokenId, address, []);
      }
    },
    [address]
  );

  const connectEthereum = useConnectEthereum();
  const handleConnectWalletButtonClick = useCallback(async () => {
    try {
      const address = await connectEthereum();
      console.log('connected address', address);
    } catch (error: unknown) {
      console.log('error conecting', error);
      if (error instanceof Error) {
        // Ignore internal error
        if (error.message === 'Promise replaced or component unmounted') {
          return;
        }
        // setError(error.message);
      }
    }
  }, [connectEthereum]);

  const handleMintButtonClick = useCallback(async () => {
    // clear any previous errors
    if (error) {
      setError('');
    }

    console.log('wtf', address);

    if (active && contract) {
      // Submit mint transaction
      setTransactionStatus(TransactionStatus.PENDING);
      const mintResult = await mintToken(contract, tokenId).catch((error: any) => {
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
          if (onMintSuccess) {
            onMintSuccess();
          }
        }
      }
    }
  }, [active, contract, error, mintToken, onMintSuccess, tokenId, address]);

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
    transactionStatus,
    transactionHash,
    error,
    handleClick,
    buttonText,
  };
}
