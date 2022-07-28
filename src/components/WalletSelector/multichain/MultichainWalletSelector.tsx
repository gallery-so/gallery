import styled from 'styled-components';
import { useCallback, useState } from 'react';
import { ADD_WALLET_TO_USER, AUTH } from 'types/Wallet';
import breakpoints from 'components/core/breakpoints';
import { graphql, useFragment } from 'react-relay';
import { MultichainWalletSelectorFragment$key } from '__generated__/MultichainWalletSelectorFragment.graphql';
import WalletButton from './WalletButton';
import { useConnectEthereum } from './useConnectEthereum';
import { ConnectionMode } from '../WalletSelector';
import { SupportedChain, supportedChains } from './supportedChains';
import { EthereumAuthenticateWallet } from './EthereumAuthenticateWallet';
import { EthereumAddWallet } from './EthereumAddWallet';

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: MultichainWalletSelectorFragment$key;
};

export function MultichainWalletSelector({ connectionMode = AUTH, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment MultichainWalletSelectorFragment on Query {
        ...EthereumAddWalletFragment
      }
    `,
    queryRef
  );

  const [selectedChain, setSelectedChain] = useState<SupportedChain>();
  const reset = useCallback(() => {
    setSelectedChain(undefined);
  }, []);

  const connectEthereum = useConnectEthereum();

  if (selectedChain) {
    // TODO: fix situation when adding a wallet where metamask is selected but already connected

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
          {selectedChain === supportedChains.ethereum ? (
            <EthereumAuthenticateWallet reset={reset} />
          ) : null}
        </StyledWalletSelector>
      );
    }
  }

  return (
    <StyledWalletSelector>
      <WalletButton
        label="Ethereum"
        // TODO: ethereum icon
        icon="metamask"
        onClick={() => {
          connectEthereum().then(
            (address) => {
              console.log('connected with', address);
              setSelectedChain(supportedChains.ethereum);
            },
            (error) => {
              console.log('failed to connect', error);
            }
          );
        }}
      />
      {/* Just fiddling with an alternative to "more wallets coming soon" */}
      <WalletButton disabled label="Tezos" icon="gnosis_safe" />
      <WalletButton disabled label="Solana" icon="gnosis_safe" />
      <WalletButton disabled label="Gnosis Safe" icon="gnosis_safe" />
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
