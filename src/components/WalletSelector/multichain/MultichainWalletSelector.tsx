import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { useBeaconActions } from '~/contexts/beacon/BeaconContext';
import { MultichainWalletSelectorFragment$key } from '~/generated/MultichainWalletSelectorFragment.graphql';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from '~/types/Wallet';

import { ConnectionMode } from '../WalletSelector';
import { EthereumAddWallet } from './EthereumAddWallet';
import { EthereumAuthenticateWallet } from './EthereumAuthenticateWallet';
import { GnosisSafeAddWallet } from './GnosisSafeAddWallet';
import { GnosisSafeAuthenticateWallet } from './GnosisSafeAuthenticateWallet';
import { SupportedAuthMethod, supportedAuthMethods } from './supportedAuthMethods';
import { TezosAddWallet } from './tezos/TezosAddWallet';
import { TezosAuthenticateWallet } from './tezos/TezosAuthenticateWallet';
import { useConnectEthereum } from './useConnectEthereum';
import WalletButton from './WalletButton';

export type WalletSelectorVariant = 'default' | 'tezos-announcement';

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: MultichainWalletSelectorFragment$key;
  variant?: WalletSelectorVariant;
  onEthAddWalletSuccess?: () => void;
  onTezosAddWalletSuccess?: () => void;
};

export function MultichainWalletSelector({
  queryRef,
  connectionMode = AUTH,
  variant = 'default',
  onEthAddWalletSuccess,
  onTezosAddWalletSuccess,
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

  if (selectedAuthMethod === supportedAuthMethods.ethereum) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <StyledWalletSelector>
          <EthereumAddWallet queryRef={query} reset={reset} onSuccess={onEthAddWalletSuccess} />
        </StyledWalletSelector>
      );
    }
    if (connectionMode === AUTH) {
      return (
        <StyledWalletSelector>
          <EthereumAuthenticateWallet reset={reset} />
        </StyledWalletSelector>
      );
    }
  }

  if (selectedAuthMethod === supportedAuthMethods.gnosisSafe) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <StyledWalletSelector>
          <GnosisSafeAddWallet queryRef={query} reset={reset} />
        </StyledWalletSelector>
      );
    }
    if (connectionMode === AUTH) {
      return (
        <StyledWalletSelector>
          <GnosisSafeAuthenticateWallet reset={reset} />
        </StyledWalletSelector>
      );
    }
  }

  if (selectedAuthMethod === supportedAuthMethods.tezos) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <StyledWalletSelector>
          <TezosAddWallet queryRef={query} reset={reset} onSuccess={onTezosAddWalletSuccess} />
        </StyledWalletSelector>
      );
    }
    if (connectionMode === AUTH) {
      return (
        <StyledWalletSelector>
          <TezosAuthenticateWallet reset={reset} />
        </StyledWalletSelector>
      );
    }
  }

  return (
    <StyledWalletSelector gap={24}>
      <VStack gap={16}>
        {variant === 'tezos-announcement' && (
          <StyledDescription>
            If you’re a new user, connect your Tezos wallet. If you’re an existing user, sign in
            with your Ethereum address before adding your Tezos wallet.
          </StyledDescription>
        )}
        <VStack justify="center" gap={8}>
          <WalletButton
            label={supportedAuthMethods.ethereum.name}
            icon="ethereum"
            onClick={() => {
              console.log('connecting to ethereum');
              connectEthereum().then(
                (address) => {
                  console.log('connected to ethereum with', address);
                  setSelectedAuthMethod(supportedAuthMethods.ethereum);
                },
                (error) => {
                  console.log('failed to connect to ethereum', error);
                }
              );
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
          <WalletButton label="Solana" icon="solana" disabled />
        </VStack>
      </VStack>
    </StyledWalletSelector>
  );
}

const StyledWalletSelector = styled(VStack)`
  text-align: center;
  width: 320px;

  @media only screen and ${breakpoints.mobileLarge} {
    width: 400px;
    max-width: 480px;
  }
`;

const StyledDescription = styled(BaseM)`
  text-align: left;
`;
