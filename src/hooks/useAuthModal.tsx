import { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import WalletSelector from 'components/WalletSelector/WalletSelector';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import { useAuthModalFragment$key } from '__generated__/useAuthModalFragment.graphql';
import { useAuthModalQuery } from '__generated__/useAuthModalQuery.graphql';

type ModalProps = {
  queryRef: useAuthModalFragment$key;
};

const AuthModal = ({ queryRef }: ModalProps) => {
  const { hideModal } = useModalActions();

  const query = useFragment(
    graphql`
      fragment useAuthModalFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
          # TODO: handle ErrNotAuthorized type
          # and display an error in the auth modal
          # if user fetch fails
        }
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

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
  const { showModal } = useModalActions();

  const query = useLazyLoadQuery<useAuthModalQuery>(
    graphql`
      query useAuthModalQuery {
        ...useAuthModalFragment
      }
    `,
    {}
  );

  return useCallback(() => {
    showModal({ content: <AuthModal queryRef={query} /> });
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
