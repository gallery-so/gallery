import { useCallback } from 'react';
import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import { ADD_WALLET_TO_USER } from 'types/Wallet';
import { graphql } from 'relay-runtime';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { useAddWalletModalFragment$key } from '__generated__/useAddWalletModalFragment.graphql';
import { useAddWalletModalQuery } from '__generated__/useAddWalletModalQuery.graphql';

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
