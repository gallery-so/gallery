import { Contract } from '@ethersproject/contracts';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import { useConnectEthereum } from '~/components/WalletSelector/multichain/useConnectEthereum';
import { TransactionStatus } from '~/constants/transaction';
import MerkleTree, { generateMerkleProof } from '~/utils/MerkleTree';

type Props = {
  contract: Contract | null;
  tokenId: number;
  allowlist?: string[];
  onMintSuccess?: () => void;
};

export default function useMintContract({ contract, tokenId, allowlist, onMintSuccess }: Props) {
  const { address: rawAddress, isConnected: active } = useAccount();

  const [error, setError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');

  const address = rawAddress?.toLowerCase();

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
      }
    }
  }, [connectEthereum]);

  useEffect(() => {
    if (allowlist) {
      const merkleTree = new MerkleTree(Array.from(allowlist));
      console.log({ allowlist, merkleRoot: merkleTree.getHexRoot() });
    }
  }, [allowlist]);

  const handleMintButtonClick = useCallback(async () => {
    // clear any previous errors
    if (error) {
      setError('');
    }

    if (active && contract) {
      // Submit mint transaction
      setTransactionStatus(TransactionStatus.PENDING);

      let mintResult;

      if (contract && address) {
        try {
          console.log('generating', address);
          const merkleProof = allowlist ? generateMerkleProof(address, Array.from(allowlist)) : [];
          console.log({ contract: contract.address, tokenId, address, merkleProof });
          mintResult = await contract.write.mint([tokenId, address, merkleProof], {
            value: ethers.utils.parseEther('0.000777'),
          });
        } catch (error: unknown) {
          // @ts-expect-error: weird contract error type has `error.error`
          let errorMessage = error?.error?.message ?? error?.message;
          console.log({ errorMessage });
          if (
            errorMessage.includes('not approved to mint') ||
            errorMessage.includes('does not exist in Merkle tree')
          ) {
            errorMessage = `${address} is not on the mintlist. If you think this is a mistake, please reach out to us on Twitter or Discord.`;
          }
          if (errorMessage.includes('cannot mint while owning poster')) {
            errorMessage = 'You already own this item. Limit 1 per address.';
          }
          if (errorMessage.includes('user rejected')) {
            errorMessage = 'You rejected the transaction';
          }
          setError(errorMessage);
          setTransactionStatus(TransactionStatus.FAILED);
        }
      }

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
  }, [active, address, allowlist, contract, error, onMintSuccess, tokenId]);

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
