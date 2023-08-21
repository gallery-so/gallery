import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';

import { useConnectEthereum } from '~/components/WalletSelector/multichain/useConnectEthereum';
import { TransactionStatus } from '~/constants/transaction';
import MerkleTree, { generateMerkleProof } from '~/utils/MerkleTree';

import { BASE_MAINNET_CHAIN_ID, WagmiContract } from './useContract';

type Props = {
  contract: WagmiContract | null;
  tokenId: number;
  allowlist?: string[];
  onMintSuccess?: () => void;
};

export default function useMintContract({ contract, tokenId, allowlist, onMintSuccess }: Props) {
  const { address: rawAddress, isConnected: active } = useAccount();
  const { chain } = useNetwork();

  const [error, setError] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);
  const [transactionHash, setTransactionHash] = useState('');

  const address = rawAddress?.toLowerCase();

  const attemptMint = useCallback(async () => {
    setTransactionStatus(TransactionStatus.PENDING);
    let mintResult;
    if (contract && address) {
      try {
        const merkleProof = allowlist ? generateMerkleProof(address, Array.from(allowlist)) : [];
        console.log({ contract: contract.address, tokenId, address, merkleProof });
        mintResult = await contract.write.mint([tokenId, address, merkleProof], {
          value: ethers.utils.parseEther('0.000777'),
        });
      } catch (error: unknown) {
        // @ts-expect-error: weird contract error type has `error.error`
        const originalErrorMessage = error?.error?.message ?? error?.message;
        let userFacingErrorMessage;

        if (typeof originalErrorMessage === 'string') {
          if (
            originalErrorMessage.includes('not approved to mint') ||
            originalErrorMessage.includes('does not exist in Merkle tree')
          ) {
            userFacingErrorMessage = `${address} is not on the mintlist. If you think this is a mistake, please reach out to us on Twitter or Discord.`;
          } else if (originalErrorMessage.toLowerCase().includes('user rejected')) {
            userFacingErrorMessage = 'Please approve the transaction to mint.';
          }
        }

        setError(userFacingErrorMessage ?? originalErrorMessage);
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
  }, [address, allowlist, contract, onMintSuccess, tokenId]);

  const handleNetworkSwitchError = useCallback(() => {
    setTransactionStatus(TransactionStatus.FAILED);
    setError('Please switch your network to Base to mint.');
  }, []);

  const { switchNetwork } = useSwitchNetwork({
    chainId: BASE_MAINNET_CHAIN_ID,
    onSuccess: attemptMint,
    onError: handleNetworkSwitchError,
  });

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
      // If the user is on a different network, prompt them to switch to Base.
      // switchNetwork has a callback to attemptMint, so we return early here.
      if (chain?.id !== BASE_MAINNET_CHAIN_ID && switchNetwork) {
        setTransactionStatus(TransactionStatus.PENDING);
        switchNetwork();
        return;
      }

      attemptMint();
    }
  }, [active, attemptMint, chain, contract, error, switchNetwork]);

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
