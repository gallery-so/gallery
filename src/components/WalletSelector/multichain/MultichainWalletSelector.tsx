import styled from 'styled-components';
import { useCallback, useState } from 'react';
import { ADD_WALLET_TO_USER, AUTH } from 'types/Wallet';
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
import { useConnectGnosisSafe } from './useConnectGnosisSafe';

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: MultichainWalletSelectorFragment$key;
};

export function MultichainWalletSelector({ connectionMode = AUTH, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment MultichainWalletSelectorFragment on Query {
        ...EthereumAddWalletFragment
        ...GnosisSafeAddWalletFragment
      }
    `,
    queryRef
  );

  const [selectedAuthMethod, setSelectedAuthMethod] = useState<SupportedAuthMethod>();
  const reset = useCallback(() => {
    setSelectedAuthMethod(undefined);
  }, []);

  const connectEthereum = useConnectEthereum();
  const connectGnosisSafe = useConnectGnosisSafe();

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

  return (
    <StyledWalletSelector>
      <WalletButton
        label={supportedAuthMethods.ethereum.name}
        // TODO: ethereum icon
        icon="metamask"
        onClick={() => {
          connectEthereum().then(
            (address) => {
              console.log('connected with', address);
              setSelectedAuthMethod(supportedAuthMethods.ethereum);
            },
            (error) => {
              console.log('failed to connect', error);
            }
          );
        }}
      />
      <WalletButton
        label={supportedAuthMethods.gnosisSafe.name}
        icon="gnosis_safe"
        onClick={() => {
          console.log('connecting with gnosis via walletconnect');
          connectGnosisSafe();
        }}
      />
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
