import { lazy, Suspense, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { WalletSelectorWrapper } from '~/components/WalletSelector/multichain/WalletSelectorWrapper';
import { WalletSelectorFragment$key } from '~/generated/WalletSelectorFragment.graphql';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from '~/types/Wallet';

import breakpoints from '../core/breakpoints';
import { BaseM } from '../core/Text/Text';
import type { MultichainWalletSelectorProps } from './multichain/MultichainWalletSelector';

const MultichainWalletSelector = lazy(() => import('./multichain/MultichainWalletSelector'));

const EthereumProviders = lazy(() => import('~/contexts/auth/EthereumProviders'));

const BeaconProvider = lazy(() => import('~/contexts/beacon/BeaconContext'));

// AUTH: authenticate with wallet (sign in)
// ADD_WALLET_TO_USER: add wallet to user
// CONNECT_WALLET: simple connect (no sign in) used to allow non-users to mint

export type ConnectionMode = typeof AUTH | typeof ADD_WALLET_TO_USER | typeof CONNECT_WALLET_ONLY;

type Props = {
  queryRef: WalletSelectorFragment$key;
} & MultichainWalletSelectorProps;

// number of connection options supported; list available in `MultichainWalletSelector.tsx`
const NUM_OPTIONS_SUPPORTED = 5;

export default function WalletSelector({
  queryRef,
  connectionMode = AUTH,
  onConnectWalletSuccess,
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

  const fallback = useMemo(
    () => (
      <WalletSelectorWrapper>
        <VStack gap={12}>
          {Array.from({ length: NUM_OPTIONS_SUPPORTED }).map(() => {
            // We don't have anything relevant to key off of here
            // eslint-disable-next-line react/jsx-key
            return <StyledSkeleton />;
          })}
          <StyledWalletHelperText>
            You can always add more wallets across networks later when setting up your Gallery.
          </StyledWalletHelperText>
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
            queryRef={query}
            connectionMode={connectionMode}
            onConnectWalletSuccess={onConnectWalletSuccess}
            showEmail={showEmail}
          />
        </EthereumProviders>
      </BeaconProvider>
      <StyledWalletHelperText>
        You can always add more wallets across networks later when setting up your Gallery.
      </StyledWalletHelperText>
    </Suspense>
  );
}

const StyledSkeleton = styled(Skeleton)`
  width: 100%;
  height: 57px;

  @media only screen and ${breakpoints.tablet} {
    width: 400px;
  }
`;

const StyledWalletHelperText = styled(BaseM)`
  max-width: 400px;
  color: ${colors.shadow};
  text-align: center;
`;
