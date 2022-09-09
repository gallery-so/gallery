import styled from 'styled-components';
import { useCallback, useState } from 'react';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from 'types/Wallet';
import breakpoints from 'components/core/breakpoints';
import { graphql, useFragment } from 'react-relay';
import { MultichainWalletSelectorFragment$key } from '__generated__/MultichainWalletSelectorFragment.graphql';
import WalletButton from './WalletButton';
import { useConnectEthereum } from './useConnectEthereum';
import { ConnectionMode } from '../WalletSelector';
import { SupportedAuthMethod, supportedAuthMethods } from './supportedAuthMethods';
import { EthereumAuthenticateWallet } from './EthereumAuthenticateWallet';
import { EthereumAddWallet } from './EthereumAddWallet';
import { GnosisSafeAddWallet } from './GnosisSafeAddWallet';
import { GnosisSafeAuthenticateWallet } from './GnosisSafeAuthenticateWallet';
import { BaseM } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { TezosAuthenticateWallet } from './tezos/TezosAuthenticateWallet';
import useMultiKeyDown from 'hooks/useMultiKeyDown';
import isProduction from 'utils/isProduction';
import { TezosAddWallet } from './tezos/TezosAddWallet';

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: MultichainWalletSelectorFragment$key;
};

const isProd = isProduction();

export function MultichainWalletSelector({ connectionMode = AUTH, queryRef }: Props) {
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
  const [isTezosConnectEnabled, setIsTezosConnectEnabled] = useState(false);

  const reset = useCallback(() => {
    setSelectedAuthMethod(undefined);
  }, []);

  const handleToggleTezosButton = useCallback(() => {
    return setIsTezosConnectEnabled(true);
  }, []);

  useMultiKeyDown(['Shift', 't'], handleToggleTezosButton);

  const connectEthereum = useConnectEthereum();

  if (selectedAuthMethod === supportedAuthMethods.ethereum) {
    if (connectionMode === ADD_WALLET_TO_USER) {
      return (
        <StyledWalletSelector>
          <EthereumAddWallet queryRef={query} reset={reset} />
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
          <TezosAddWallet queryRef={query} reset={reset} />
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
    <StyledWalletSelector>
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
        disabled={!isTezosConnectEnabled}
        onClick={() => {
          console.log('connecting to tezos via beacon');
          setSelectedAuthMethod(supportedAuthMethods.tezos);
        }}
      />
      <WalletButton label="Solana" icon="solana" disabled />
      <Spacer height={16} />
      <BaseM>More chains coming soon™</BaseM>
    </StyledWalletSelector>
  );
}

const StyledWalletSelector = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  width: 320px;
  justify-content: center;

  @media only screen and ${breakpoints.mobileLarge} {
    width: 400px;
    max-width: 480px;
  }
`;
