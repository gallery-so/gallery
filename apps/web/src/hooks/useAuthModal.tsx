import { useCallback } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { WalletSelectorVariant } from '~/components/WalletSelector/multichain/MultichainWalletSelector';
import WalletSelector from '~/components/WalletSelector/WalletSelector';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useAuthModalFragment$key } from '~/generated/useAuthModalFragment.graphql';
import { useAuthModalQuery } from '~/generated/useAuthModalQuery.graphql';

type ModalProps = {
  queryRef: useAuthModalFragment$key;
  variant?: WalletSelectorVariant;
};

export const AuthModal = ({ queryRef, variant = 'sign-in' }: ModalProps) => {
  const query = useFragment(
    graphql`
      fragment useAuthModalFragment on Query {
        ...WalletSelectorFragment
      }
    `,
    queryRef
  );

  return (
    <Container>
      <WalletSelector queryRef={query} showEmail={variant !== 'sign-up'} />
    </Container>
  );
};

const Container = styled(VStack)`
  display: flex;
  justify-content: center;

  // the height of the inner content with all wallet options listed.
  // ensures the height of the modal doesn't shift
  min-height: 320px;
  height: 100%;
`;

export default function useAuthModal(variant: WalletSelectorVariant) {
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
      content: <AuthModal queryRef={query} variant={variant} />,
      headerText: variant === 'sign-up' ? 'Sign Up' : 'Sign In',
    });
  }, [query, variant, showModal]);
}
