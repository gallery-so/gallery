import { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useAuthModalFragment$key } from '__generated__/useAuthModalFragment.graphql';
import { useAuthModalQuery } from '__generated__/useAuthModalQuery.graphql';

type ModalProps = {
  queryRef: useAuthModalFragment$key;
};

const AuthModal = ({ queryRef }: ModalProps) => {
  const { hideModal } = useModal();
  const isAuthenticated = useIsAuthenticated();

  const query = useFragment(
    graphql`
      fragment useAuthModalFragment on Query {
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  useEffect(() => {
    if (isAuthenticated) {
      hideModal();
    }
  }, [isAuthenticated, hideModal]);

  return (
    <Container>
      <WalletSelector queryRef={query} />
    </Container>
  );
};

export default function useAuthModal() {
  const { showModal } = useModal();

  const query = useLazyLoadQuery<useAuthModalQuery>(
    graphql`
      query useAuthModalQuery {
        ...useAuthModalFragment
      }
    `,
    {}
  );

  return useCallback(() => {
    showModal(<AuthModal queryRef={query} />);
  }, [query, showModal]);
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  min-height: 300px;
`;
