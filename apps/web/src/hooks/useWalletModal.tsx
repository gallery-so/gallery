import { useCallback } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import WalletSelector from '~/components/WalletSelector/WalletSelector';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useWalletModalFragment$key } from '~/generated/useWalletModalFragment.graphql';
import { useWalletModalQuery } from '~/generated/useWalletModalQuery.graphql';
import { CONNECT_WALLET_ONLY } from '~/types/Wallet';

type ModalProps = {
  queryRef: useWalletModalFragment$key;
};

const WalletModal = ({ queryRef }: ModalProps) => {
  const query = useFragment(
    graphql`
      fragment useWalletModalFragment on Query {
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  return (
    <Container>
      <WalletSelector connectionMode={CONNECT_WALLET_ONLY} queryRef={query} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  min-height: 280px;
  height: 100%;
`;

export default function useWalletModal() {
  const { showModal } = useModalActions();

  const query = useLazyLoadQuery<useWalletModalQuery>(
    graphql`
      query useWalletModalQuery {
        ...useWalletModalFragment
      }
    `,
    {}
  );

  return useCallback(() => {
    showModal({ content: <WalletModal queryRef={query} />, headerText: 'Connect your wallet' });
  }, [query, showModal]);
}
