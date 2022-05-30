import { useCallback } from 'react';
import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import { CONNECT_WALLET_ONLY } from 'types/Wallet';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useWalletModalQuery } from '__generated__/useWalletModalQuery.graphql';
import { useWalletModalFragment$key } from '__generated__/useWalletModalFragment.graphql';
import breakpoints from 'components/core/breakpoints';

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
  min-height: 360px;
  height: 100%;

  padding: 48px 24px;
  @media only screen and ${breakpoints.tablet} {
    padding: 0;
  }
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
    showModal({ content: <WalletModal queryRef={query} /> });
  }, [query, showModal]);
}
