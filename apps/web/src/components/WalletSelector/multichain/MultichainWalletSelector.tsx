import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { WalletSelectorWrapper } from '~/components/WalletSelector/multichain/WalletSelectorWrapper';
import { useBeaconActions } from '~/contexts/beacon/BeaconContext';
import { MultichainWalletSelectorFragment$key } from '~/generated/MultichainWalletSelectorFragment.graphql';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from '~/types/Wallet';

import { ConnectionMode } from '../WalletSelector';
import DelegateCashMessage from './DelegateCashMessage';
import { EthereumAddWallet } from './EthereumAddWallet';
import { EthereumAuthenticateWallet } from './EthereumAuthenticateWallet';
import { GnosisSafeAddWallet } from './GnosisSafeAddWallet';
import { GnosisSafeAuthenticateWallet } from './GnosisSafeAuthenticateWallet';
import MagicLinkLogin from './MagicLinkLogin';
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

export default function MultichainWalletSelector({
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
        <WalletSelectorWrapper>
          <EthereumAddWallet queryRef={query} reset={reset} onSuccess={onEthAddWalletSuccess} />
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
          <GnosisSafeAddWallet queryRef={query} reset={reset} />
        </WalletSelectorWrapper>
      );
    }

    if (connectionMode === AUTH) {
      return (
        <WalletSelectorWrapper>
          <GnosisSafeAuthenticateWallet reset={reset} />
        </WalletSelectorWrapper>
      );
    }
  }

  if (selectedAuthMethod === supportedAuthMethods.tezos) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <WalletSelectorWrapper>
          <TezosAddWallet queryRef={query} reset={reset} onSuccess={onTezosAddWalletSuccess} />
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

  if (selectedAuthMethod === supportedAuthMethods.magicLink) {
    return (
      <WalletSelectorWrapper>
        <MagicLinkLogin reset={reset} />
      </WalletSelectorWrapper>
    );
  }

  return (
    <WalletSelectorWrapper gap={24}>
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
          {connectionMode === AUTH ? (
            <WalletButton
              label={supportedAuthMethods.magicLink.name}
              onClick={() => {
                setSelectedAuthMethod(supportedAuthMethods.magicLink);
              }}
              icon="magic_link"
            ></WalletButton>
          ) : null}
        </VStack>
      </VStack>
    </WalletSelectorWrapper>
  );
}

const StyledDescription = styled(BaseM)`
  text-align: left;
`;
