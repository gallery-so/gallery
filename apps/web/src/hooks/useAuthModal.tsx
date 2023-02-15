import { useCallback, useEffect, useMemo } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { WalletSelectorVariant } from '~/components/WalletSelector/multichain/MultichainWalletSelector';
import WalletSelector from '~/components/WalletSelector/WalletSelector';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useAuthModalFragment$key } from '~/generated/useAuthModalFragment.graphql';
import { useAuthModalQuery } from '~/generated/useAuthModalQuery.graphql';

type AuthType = 'signIn' | 'signUp';

type ModalProps = {
  queryRef: useAuthModalFragment$key;
  variant?: WalletSelectorVariant;
  authType?: AuthType;
};

export const AuthModal = ({ queryRef, variant, authType = 'signIn' }: ModalProps) => {
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
      hideModal({ id: 'auth' });
    }
  }, [isAuthenticated, hideModal]);

  const subheading = useMemo(() => {
    switch (authType) {
      case 'signIn':
        return 'Sign in to your Gallery account using a wallet or email.';
      case 'signUp':
        return 'Join Gallery today to curate and display your NFT collection.';
      default:
        return '';
    }
  }, [authType]);

  return (
    <Container>
      <VStack gap={16}>
        <BaseM>{subheading}</BaseM>
        <WalletSelector queryRef={query} variant={variant} showEmail={authType !== 'signUp'} />
      </VStack>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;

  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  min-height: 320px;
  height: 100%;
`;

export default function useAuthModal(authType: AuthType) {
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
    showModal({
      id: 'auth',
      content: <AuthModal queryRef={query} authType={authType} />,
      headerText: authType === 'signUp' ? 'Sign Up' : 'Sign In',
    });
  }, [query, authType, showModal]);
}
