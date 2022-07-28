import styled from 'styled-components';
import { useCallback, useState } from 'react';
import { BaseM } from 'components/core/Text/Text';
import { Button } from 'components/core/Button/Button';
import { AUTH } from 'types/Wallet';
import breakpoints from 'components/core/breakpoints';
import { graphql, useFragment } from 'react-relay';
import { MultichainWalletSelectorFragment$key } from '__generated__/MultichainWalletSelectorFragment.graphql';
import WalletButton from './WalletButton';
import { useConnectEthereum } from './useConnectEthereum';
import { ConnectionMode } from '../WalletSelector';
import { SupportedChain, supportedChains } from './supportedChains';
import { AuthenticateEthereum } from './AuthenticateEthereum';

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: MultichainWalletSelectorFragment$key;
};

export function MultichainWalletSelector({ connectionMode = AUTH, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment MultichainWalletSelectorFragment on Query {
        ...AddWalletPendingFragment
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
    // if (connectionMode === ADD_WALLET_TO_USER) {
    //   return (
    //     <StyledWalletSelector>
    //       <AddWalletPending
    //         queryRef={query}
    //         setDetectedError={setDetectedError}
    //         pendingWallet={pendingWallet}
    //         userFriendlyWalletName={userFriendlyWalletName}
    //         walletName={pendingWalletName}
    //       />
    //     </StyledWalletSelector>
    //   );
    // }

    if (connectionMode === AUTH) {
      return (
        <StyledWalletSelector>
          {selectedChain === supportedChains.ethereum ? (
            <AuthenticateEthereum reset={reset} />
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

const StyledBody = styled(BaseM)`
  margin-bottom: 30px;
  white-space: pre-wrap;
`;

const StyledRetryButton = styled(Button)`
  width: 200px;
  align-self: center;
`;
