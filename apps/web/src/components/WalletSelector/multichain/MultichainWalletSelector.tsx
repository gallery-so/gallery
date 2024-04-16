import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { WalletSelectorWrapper } from '~/components/WalletSelector/multichain/WalletSelectorWrapper';
import { Web3WalletProvider } from '~/contexts/auth/Web3WalletContext';
import { useBeaconActions } from '~/contexts/beacon/BeaconContext';
import { MultichainWalletSelectorFragment$key } from '~/generated/MultichainWalletSelectorFragment.graphql';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { chains } from '~/shared/utils/chains';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from '~/types/Wallet';

import { ConnectionMode } from '../WalletSelector';
import DelegateCashMessage from './DelegateCashMessage';
import { EthereumAddWallet } from './EthereumAddWallet';
import { EthereumAuthenticateWallet } from './EthereumAuthenticateWallet';
import { GnosisSafeAddWallet } from './GnosisSafeAddWallet';
import { GnosisSafeAuthenticateWallet } from './GnosisSafeAuthenticateWallet';
import { SupportedAuthMethod, supportedAuthMethods } from './supportedAuthMethods';
import { TezosAddWallet } from './tezos/TezosAddWallet';
import { TezosAuthenticateWallet } from './tezos/TezosAuthenticateWallet';
import { useConnectEthereum } from './useConnectEthereum';
import WalletButton from './WalletButton';

export type WalletSelectorVariant = 'sign-in' | 'sign-up';

export type OnConnectWalletSuccessFn = () => void;

export type MultichainWalletSelectorProps = {
  connectionMode?: ConnectionMode;
  onConnectWalletSuccess?: OnConnectWalletSuccessFn;
};

type Props = {
  queryRef: MultichainWalletSelectorFragment$key;
} & MultichainWalletSelectorProps;

export default function MultichainWalletSelector({
  queryRef,
  connectionMode = AUTH,
  onConnectWalletSuccess,
}: Props) {
  const query = useFragment(
    graphql`
      fragment MultichainWalletSelectorFragment on Query {
        ...EthereumAddWalletFragment
        ...GnosisSafeAddWalletFragment
        ...TezosAddWalletFragment
      }
    `,
    queryRef
  );

  const [selectedAuthMethod, setSelectedAuthMethod] = useState<SupportedAuthMethod>();

  const reset = useCallback(() => {
    setSelectedAuthMethod(undefined);
  }, []);

  const connectEthereum = useConnectEthereum();
  const { requestPermissions: connectTezos } = useBeaconActions();

  const additionalEthereumChains = useMemo(
    () =>
      chains.filter(
        (chain) => chain.baseChain === 'Ethereum' && chain.name !== 'Ethereum' && chain.isEnabled
      ),
    []
  );

  const track = useTrack();

  if (selectedAuthMethod === supportedAuthMethods.ethereum) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <WalletSelectorWrapper>
          <EthereumAddWallet queryRef={query} reset={reset} onSuccess={onConnectWalletSuccess} />
        </WalletSelectorWrapper>
      );
    }
    if (connectionMode === AUTH) {
      return (
        <WalletSelectorWrapper>
          <EthereumAuthenticateWallet reset={reset} />
        </WalletSelectorWrapper>
      );
    }
  }

  if (selectedAuthMethod === supportedAuthMethods.gnosisSafe) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <WalletSelectorWrapper>
          <Web3WalletProvider>
            <GnosisSafeAddWallet queryRef={query} reset={reset} />
          </Web3WalletProvider>
        </WalletSelectorWrapper>
      );
    }

    if (connectionMode === AUTH) {
      return (
        <WalletSelectorWrapper>
          <Web3WalletProvider>
            <GnosisSafeAuthenticateWallet reset={reset} />
          </Web3WalletProvider>
        </WalletSelectorWrapper>
      );
    }
  }

  if (selectedAuthMethod === supportedAuthMethods.tezos) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <WalletSelectorWrapper>
          <TezosAddWallet queryRef={query} reset={reset} onSuccess={onConnectWalletSuccess} />
        </WalletSelectorWrapper>
      );
    }
    if (connectionMode === AUTH) {
      return (
        <WalletSelectorWrapper>
          <TezosAuthenticateWallet reset={reset} />
        </WalletSelectorWrapper>
      );
    }
  }

  if (selectedAuthMethod === supportedAuthMethods.delegateCash) {
    return (
      <WalletSelectorWrapper>
        <DelegateCashMessage reset={reset} />
      </WalletSelectorWrapper>
    );
  }

  console.log({ selectedAuthMethod });

  return (
    <WalletSelectorWrapper gap={24}>
      <VStack gap={16}>
        <VStack justify="center" gap={12}>
          <WalletButton
            label={supportedAuthMethods.ethereum.name}
            icon="ethereum"
            additionalChains={additionalEthereumChains}
            onClick={async () => {
              console.log('connecting to ethereum');
              const address = await connectEthereum();
              if (address) {
                console.log('connected to ethereum with', address);
                setSelectedAuthMethod(supportedAuthMethods.ethereum);
              }
            }}
          />

          <WalletButton
            label="Tezos"
            icon="tezos"
            onClick={() => {
              console.log('connecting to tezos via beacon');
              connectTezos()
                .then((address) => {
                  console.log('connected to tezos with', address);
                  setSelectedAuthMethod(supportedAuthMethods.tezos);
                })
                .catch((error) => {
                  console.log('failed to connect to tezos', error);
                });
            }}
          />

          {connectionMode !== CONNECT_WALLET_ONLY ? (
            <WalletButton
              label={supportedAuthMethods.gnosisSafe.name}
              icon="gnosis_safe"
              onClick={() => {
                console.log('connecting to gnosis safe via walletconnect');
                setSelectedAuthMethod(supportedAuthMethods.gnosisSafe);
              }}
            />
          ) : null}

          <WalletButton
            label={supportedAuthMethods.delegateCash.name}
            icon="delegate_cash"
            onClick={() => {
              setSelectedAuthMethod(supportedAuthMethods.delegateCash);
            }}
          />

          <WalletButton
            label="Solana"
            icon="solana"
            disabled
            onClick={() => {
              track('Selected Auth Option', {
                method: 'solana',
                context:
                  connectionMode === AUTH ? contexts.Authentication : contexts['Manage Wallets'],
              });
            }}
          />
        </VStack>
        <StyledWalletHelperText>
          You can always add more wallets across networks later when setting up your Gallery.
        </StyledWalletHelperText>
      </VStack>
    </WalletSelectorWrapper>
  );
}

const StyledWalletHelperText = styled(BaseM)`
  max-width: 400px;
  color: ${colors.shadow};
  text-align: center;
`;
