import { Contract } from '@ethersproject/contracts';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import web3 from 'web3';

import { useConnectEthereum } from '~/components/WalletSelector/multichain/useConnectEthereum';
import { TransactionStatus } from '~/constants/transaction';
import { MAX_NFTS_PER_WALLET } from '~/scenes/MerchStorePage/constants';
import premiumAndActiveDiscordMembers from '~/snapshots/aug_2022_merch/premiumAndActiveDiscordMembers.json';
import MerkleTree from '~/utils/MerkleTree';

type Props = {
  contract: Contract | null;
  tokenId: number;
  onMintSuccess?: () => void;
  quantity?: number;
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

  // SUPPLIES
  const [publicSupply, setPublicSupply] = useState(0);
  const [usedPublicSupply, setUsedPublicSupply] = useState(0);
  const [userOwnedSupply, setUserOwnedSupply] = useState(0);
  const [soldOut, setSoldOut] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(BigNumber.from(0));

  // Show first 3 and last 3 characters of address
  const truncate = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Need to figure out a better way to type contracts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSupplies = useCallback(async (contract: any, tokenId: number) => {
    if (contract) {
      return [await contract.getPublicSupply(tokenId), await contract.getUsedPublicSupply(tokenId)];
    }
  }, []);

  const getUserOwnedSupply = useCallback(
    // Need to figure out a better way to type contracts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (contract: any) => {
      if (contract && address) {
        try {
          const balance = await contract.balanceOfType(tokenId, address);
          return web3.utils.hexToNumber(balance);
        } catch {
          return 0;
        }
      }
    },
    [address, tokenId]
  );

  const getTokenPrice = useCallback(
    // Need to figure out a better way to type contracts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (contract: any) => {
      if (contract) {
        return await contract.getPrice(tokenId);
      }
    },
    [tokenId]
  );

  // Run getRemainingSupply once on mount and then update the remaining supply.
  useEffect(() => {
    async function effect() {
      const supplies = await updateSupplies(contract, tokenId);
      const sup = web3.utils.hexToNumber(supplies?.[0]);
      const used = web3.utils.hexToNumber(supplies?.[1]);
      setPublicSupply(sup);
      setUsedPublicSupply(used);
      setSoldOut(sup - used === 0);

      const userOwned = await getUserOwnedSupply(contract);
      setUserOwnedSupply(userOwned || 0);

      const price = await getTokenPrice(contract);
      setTokenPrice(price);

      // console.log('Total supply: ', sup);
      // console.log('Used supply: ', used);
      // console.log('User currently owns: ', userOwnedSupply);
      // console.log('Token price: ', price);
    }

    effect();
    return () => {
      // cleanup
    };
  }, [
    contract,
    tokenId,
    updateSupplies,
    publicSupply,
    usedPublicSupply,
    getUserOwnedSupply,
    userOwnedSupply,
    getTokenPrice,
  ]);

  useEffect(() => {
    const merkleTree = new MerkleTree(Array.from(premiumAndActiveDiscordMembers));
    console.log('root', merkleTree.getHexRoot());
  }, []);

  function generateMerkleProof(address: string, allowlist: string[]) {
    const merkleTree = new MerkleTree(allowlist);
    return merkleTree.getHexProof(address);
  }

  const totalPrice = useCallback(
    // Need to figure out a better way to type contracts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (contract: any) => {
      if (!quantity) return;
      if (contract) {
        const price = tokenPrice.mul(quantity);
        return price;
      }
    },
    [quantity, tokenPrice]
  );

  const mintToken = useCallback(
    async (contract: Contract, tokenId: number, quantity: number) => {
      console.log({ premiumAndActiveDiscordMembers });

      const price = await totalPrice(contract);

      if (contract && address) {
        const merkleProof = (await contract.isAllowlistOnly(tokenId))
          ? generateMerkleProof(address, Array.from(premiumAndActiveDiscordMembers))
          : [];
        return contract.mint(address, tokenId, quantity, merkleProof, {
          value: price,
        });
      }
    },
    [address, totalPrice]
  );

  const handleMintButtonClick = useCallback(async () => {
    // clear any previous errors
    if (error) {
      setError('');
    }

    if (active && contract) {
      if (!quantity) return;
      // Submit mint transaction
      setTransactionStatus(TransactionStatus.PENDING);
      // Need to figure out a better way to type contracts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mintResult = await mintToken(contract, tokenId, quantity).catch((error: any) => {
        console.log(error);
        // TODO: Can handle additional errors here if we want
        if (
          error?.error?.message === 'execution reverted: Merch: minting is disabled' ||
          error?.error?.message === 'execution reverted: Merch: not allowlisted' ||
          error?.message === 'Element does not exist in Merkle tree'
        ) {
          setError(
            `Your address ${
              address ? truncate(address) : ''
            } is not on the allowlist. Please refer to our <a href="https://gallery.mirror.xyz/Yw-Stzpz0PTtrPMw-P-XKnSQn8eDC1o_WnP-c19r8V0#drop-schedule" target="_blank" rel="noopener noreferrer">mint schedule</a>.`
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
            const supplies = await updateSupplies(contract, tokenId);
            const sup = web3.utils.hexToNumber(supplies?.[0]);
            const used = web3.utils.hexToNumber(supplies?.[1]);
            setPublicSupply(sup);
            setUsedPublicSupply(used);
            setSoldOut(sup - used === 0);
            onMintSuccess();
          }
        }
      }
    }
  }, [
    active,
    contract,
    error,
    mintToken,
    onMintSuccess,
    tokenId,
    quantity,
    updateSupplies,
    address,
  ]);

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

    if (userOwnedSupply === MAX_NFTS_PER_WALLET) {
      return `Minted ${MAX_NFTS_PER_WALLET}/${MAX_NFTS_PER_WALLET}`;
    }

    return 'Mint';
  }, [active, transactionStatus, userOwnedSupply]);

  return {
    active,
    address,
    transactionStatus,
    transactionHash,
    error,
    handleClick,
    buttonText,
    publicSupply,
    usedPublicSupply,
    soldOut,
    userOwnedSupply,
    getUserOwnedSupply,
    tokenPrice,
  };
}
