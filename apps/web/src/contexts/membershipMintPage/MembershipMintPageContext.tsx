import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { WagmiContract } from '~/hooks/useContract';

function computeRemainingSupply(usedSupply: number, totalSupply: number) {
  return Math.max(totalSupply - usedSupply, 0);
}

export type MembershipMintPageState = {
  totalSupply: number;
  remainingSupply: number | null;
  price: number;
};

export const MembershipMintPageContext = createContext<MembershipMintPageState | undefined>(
  undefined
);

export const useMembershipMintPageState = (): MembershipMintPageState => {
  const context = useContext(MembershipMintPageContext);
  if (!context) {
    throw new Error('Attempted to use MembershipMintPageContext without a provider');
  }

  return context;
};

type MembershipMintPageActions = {
  setTotalSupply: (totalSupply: number) => void;
  setRemainingSupply: (remainingSupply: number) => void;
  getSupply: (contract: WagmiContract, tokenId: number) => void;
  getPrice: (contract: WagmiContract, tokenId: number) => void;
  setPrice: (price: number) => void;
};

const MembershipMintPageActionsContext = createContext<MembershipMintPageActions | undefined>(
  undefined
);

export const useMembershipMintPageActions = (): MembershipMintPageActions => {
  const context = useContext(MembershipMintPageActionsContext);
  if (!context) {
    throw new Error('Attempted to use MembershipMintPageActionsContext without a provider');
  }

  return context;
};

type Props = { children: ReactNode };

const MembershipMintPageProvider = memo(({ children }: Props) => {
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [remainingSupply, setRemainingSupply] = useState<number | null>(null);
  const [price, setPrice] = useState<number>(0);

  const state = useMemo(
    () => ({
      totalSupply,
      remainingSupply,
      price,
    }),
    [price, remainingSupply, totalSupply]
  );

  const getSupply = useCallback(
    async (contract: WagmiContract, tokenId: number) => {
      const totalSupply = await contract.read.getTotalSupply([tokenId]);
      const usedSupply = await contract.read.getUsedSupply([tokenId]);

      setTotalSupply(Number(totalSupply));
      setRemainingSupply(computeRemainingSupply(Number(usedSupply), Number(totalSupply)));
    },
    [setRemainingSupply, setTotalSupply]
  );

  const getPrice = useCallback(
    async (contract: WagmiContract, tokenId: number) => {
      const price = await contract.read.getPrice([tokenId]);
      setPrice(Number(price));
    },
    [setPrice]
  );

  const MembershipMintPageActions: MembershipMintPageActions = useMemo(
    () => ({ setTotalSupply, setRemainingSupply, setPrice, getSupply, getPrice }),
    [setTotalSupply, setRemainingSupply, setPrice, getSupply, getPrice]
  );

  return (
    <MembershipMintPageContext.Provider value={state}>
      <MembershipMintPageActionsContext.Provider value={MembershipMintPageActions}>
        {children}
      </MembershipMintPageActionsContext.Provider>
    </MembershipMintPageContext.Provider>
  );
});

MembershipMintPageProvider.displayName = 'MembershipMintPageProvider';

export default MembershipMintPageProvider;
