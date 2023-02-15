import { lazy, Suspense, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { graphql, useFragment } from 'react-relay';

import { VStack } from '~/components/core/Spacer/Stack';
import { WalletSelectorWrapper } from '~/components/WalletSelector/multichain/WalletSelectorWrapper';
import { WalletSelectorFragment$key } from '~/generated/WalletSelectorFragment.graphql';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from '~/types/Wallet';

import type { WalletSelectorVariant } from './multichain/MultichainWalletSelector';

const MultichainWalletSelector = lazy(() => import('./multichain/MultichainWalletSelector'));

const EthereumProviders = lazy(() => import('~/contexts/auth/EthereumProviders'));

const BeaconProvider = lazy(() => import('~/contexts/beacon/BeaconContext'));

// AUTH: authenticate with wallet (sign in)
// ADD_WALLET_TO_USER: add wallet to user
// CONNECT_WALLET: simple connect (no sign in) used to allow non-users to mint

export type ConnectionMode = typeof AUTH | typeof ADD_WALLET_TO_USER | typeof CONNECT_WALLET_ONLY;

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: WalletSelectorFragment$key;
  variant?: WalletSelectorVariant;
  onEthAddWalletSuccess?: () => void;
  onTezosAddWalletSuccess?: () => void;
  showEmail?: boolean;
};

// number of connection options supported; list available in `MultichainWalletSelector.tsx`
const NUM_OPTIONS_SUPPORTED = 5;

export default function WalletSelector({
  queryRef,
  connectionMode = AUTH,
  variant,
  onEthAddWalletSuccess,
  onTezosAddWalletSuccess,
  showEmail = true,
}: Props) {
  // Usually we'd want to pass in a query variable and use @skip to conditionally
  // return certain data fragments, but in this case, we have lots of queries that
  // bundle this fragment and the two branches won't differ enough to be concerning
  // so we're using both for now.
  const query = useFragment(
    graphql`
      fragment WalletSelectorFragment on Query {
        ...MultichainWalletSelectorFragment
      }
    `,
    queryRef
  );

  const numOptionsToShow: number = useMemo(
    () => (showEmail ? NUM_OPTIONS_SUPPORTED : NUM_OPTIONS_SUPPORTED - 1),
    []
  );

  const fallback = useMemo(
    () => (
      <WalletSelectorWrapper>
        <VStack gap={8}>
          {Array.from({ length: numOptionsToShow }).map(() => {
            // We don't have anything relevant to key off of here
            // eslint-disable-next-line react/jsx-key
            return <Skeleton width="100%" height="52px" />;
          })}
        </VStack>
      </WalletSelectorWrapper>
    ),
    []
  );

  return (
    <Suspense fallback={fallback}>
      <BeaconProvider>
        <EthereumProviders>
          <MultichainWalletSelector
            connectionMode={connectionMode}
            queryRef={query}
            variant={variant}
            onEthAddWalletSuccess={onEthAddWalletSuccess}
            onTezosAddWalletSuccess={onTezosAddWalletSuccess}
            showEmail={showEmail}
          />
        </EthereumProviders>
      </BeaconProvider>
    </Suspense>
  );
}
