import { useCallback } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { OnConnectWalletSuccessFn } from '~/components/WalletSelector/multichain/MultichainWalletSelector';
import WalletSelector from '~/components/WalletSelector/WalletSelector';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useAddWalletModalFragment$key } from '~/generated/useAddWalletModalFragment.graphql';
import { useAddWalletModalQuery } from '~/generated/useAddWalletModalQuery.graphql';
import { ADD_WALLET_TO_USER } from '~/types/Wallet';

type ModalProps = {
  queryRef: useAddWalletModalFragment$key;
  onConnectWalletSuccess?: OnConnectWalletSuccessFn;
};

const AddWalletModal = ({ queryRef, onConnectWalletSuccess }: ModalProps) => {
  const query = useFragment(
    graphql`
      fragment useAddWalletModalFragment on Query {
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  return (
    <Container>
      <WalletSelector
        connectionMode={ADD_WALLET_TO_USER}
        queryRef={query}
        onConnectWalletSuccess={onConnectWalletSuccess}
      />
    </Container>
  );
};

type Props = {
  onConnectWalletSuccess?: OnConnectWalletSuccessFn;
};

export default function useAddWalletModal() {
  const { showModal } = useModalActions();

  const query = useLazyLoadQuery<useAddWalletModalQuery>(
    graphql`
      query useAddWalletModalQuery {
        ...useAddWalletModalFragment
      }
    `,
    {}
  );

  return useCallback(
    ({ onConnectWalletSuccess }: Props) => {
      showModal({
        id: 'add-wallet-modal',
        content: (
          <AddWalletModal queryRef={query} onConnectWalletSuccess={onConnectWalletSuccess} />
        ),
        headerText: 'Connect your wallet',
      });
    },
    [query, showModal]
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 280px;
  height: 100%;
`;
