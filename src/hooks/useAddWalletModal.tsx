import { useCallback } from 'react';
import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import { ADD_WALLET_TO_USER } from 'types/Wallet';
import { graphql } from 'relay-runtime';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { useAddWalletModalFragment$key } from '__generated__/useAddWalletModalFragment.graphql';
import { useAddWalletModalQuery } from '__generated__/useAddWalletModalQuery.graphql';
import breakpoints from 'components/core/breakpoints';

type ModalProps = {
  queryRef: useAddWalletModalFragment$key;
};

const AddWalletModal = ({ queryRef }: ModalProps) => {
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
      <WalletSelector connectionMode={ADD_WALLET_TO_USER} queryRef={query} />
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

  return useCallback(() => {
    showModal({ content: <AddWalletModal queryRef={query} /> });
  }, [query, showModal]);
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 280px;

  padding: 48px 24px;
  @media only screen and ${breakpoints.tablet} {
    padding: 0;
  }
`;
