import { useCallback } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import WalletSelector from '~/components/WalletSelector/WalletSelector';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useAddWalletModalFragment$key } from '~/generated/useAddWalletModalFragment.graphql';
import { useAddWalletModalQuery } from '~/generated/useAddWalletModalQuery.graphql';
import { ADD_WALLET_TO_USER } from '~/types/Wallet';

type ModalProps = {
  queryRef: useAddWalletModalFragment$key;
  onTezosAddWalletSuccess?: () => void;
  onEthAddWalletSuccess?: () => void;
};

const AddWalletModal = ({
  queryRef,
  onEthAddWalletSuccess,
  onTezosAddWalletSuccess,
}: ModalProps) => {
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
        onEthAddWalletSuccess={onEthAddWalletSuccess}
        onTezosAddWalletSuccess={onTezosAddWalletSuccess}
      />
    </Container>
  );
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

  type Props = {
    onEthAddWalletSuccess?: () => void;
    onTezosAddWalletSuccess?: () => void;
  };

  return useCallback(
    ({ onEthAddWalletSuccess, onTezosAddWalletSuccess }: Props) => {
      showModal({
        id: 'add-wallet-modal',
        content: (
          <AddWalletModal
            queryRef={query}
            onTezosAddWalletSuccess={onEthAddWalletSuccess}
            onEthAddWalletSuccess={onTezosAddWalletSuccess}
          />
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
