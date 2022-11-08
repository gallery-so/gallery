import { useCallback, useEffect } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { WalletSelectorVariant } from '~/components/WalletSelector/multichain/MultichainWalletSelector';
import WalletSelector from '~/components/WalletSelector/WalletSelector';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useAuthModalFragment$key } from '~/generated/useAuthModalFragment.graphql';
import { useAuthModalQuery } from '~/generated/useAuthModalQuery.graphql';

type ModalProps = {
  queryRef: useAuthModalFragment$key;
  variant?: WalletSelectorVariant;
};

export const AuthModal = ({ queryRef, variant }: ModalProps) => {
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
      <WalletSelector queryRef={query} variant={variant} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  min-height: 320px;
  height: 100%;
`;

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
    showModal({ content: <AuthModal queryRef={query} />, headerText: 'Connect your wallet' });
  }, [query, showModal]);
}
